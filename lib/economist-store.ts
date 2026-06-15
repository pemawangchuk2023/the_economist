import "server-only";

import { normalizeObjectKey, sortIssues, withDownloadCount } from "@/lib/economist";
import {
  getR2ObjectText,
  isR2ConditionalWriteError,
  isR2NotFoundError,
  putR2ObjectText,
} from "@/lib/r2";
import type { BookmarkRecord, LibraryStore, PdfIssue } from "@/types/economist";

type UserLibraryStore = {
  bookmarks: Record<string, BookmarkRecord>;
};

type PersistedLibraryStore = {
  version: 1;
  users: Record<string, UserLibraryStore>;
  downloadCounts: Record<string, number>;
};

type StoreSnapshot = {
  state: PersistedLibraryStore;
  etag?: string;
  exists: boolean;
};

const storeKey =
  process.env.R2_LIBRARY_STORE_KEY?.trim() || "_app/economist-library.json";
const maxWriteAttempts = 5;

let storeWriteQueue = Promise.resolve();

const createEmptyPersistedStore = (): PersistedLibraryStore => ({
  version: 1,
  users: {},
  downloadCounts: {},
});

const normalizeDownloadCounts = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, count]) => [
        normalizeObjectKey(key),
        typeof count === "number" && Number.isFinite(count)
          ? Math.max(0, Math.trunc(count))
          : 0,
      ])
      .filter(([key]) => Boolean(key))
  );
};

const normalizeBookmarks = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, BookmarkRecord>)
      .filter(([, bookmark]) => bookmark?.key && bookmark?.bookmarkedAt)
      .map(([, bookmark]) => [
        normalizeObjectKey(bookmark.key),
        {
          ...bookmark,
          key: normalizeObjectKey(bookmark.key),
          downloadCount:
            typeof bookmark.downloadCount === "number"
              ? Math.max(0, Math.trunc(bookmark.downloadCount))
              : 0,
        },
      ])
  );
};

const normalizeUsers = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, Partial<UserLibraryStore>>)
      .filter(([userId]) => Boolean(userId))
      .map(([userId, userStore]) => [
        userId,
        {
          bookmarks: normalizeBookmarks(userStore.bookmarks),
        },
      ])
  );
};

const normalizePersistedStore = (value: unknown): PersistedLibraryStore => {
  if (!value || typeof value !== "object") {
    return createEmptyPersistedStore();
  }

  const store = value as Partial<PersistedLibraryStore> & {
    bookmarks?: Record<string, BookmarkRecord>;
  };

  return {
    version: 1,
    users: normalizeUsers(store.users),
    downloadCounts: normalizeDownloadCounts(store.downloadCounts),
  };
};

const readPersistedStore = async (): Promise<StoreSnapshot> => {
  try {
    const { text, etag } = await getR2ObjectText(storeKey);
    const parsed = text.trim() ? JSON.parse(text) : undefined;

    return {
      state: normalizePersistedStore(parsed),
      etag,
      exists: true,
    };
  } catch (error) {
    if (isR2NotFoundError(error)) {
      return {
        state: createEmptyPersistedStore(),
        exists: false,
      };
    }

    throw error;
  }
};

const writePersistedStore = async ({ state, etag, exists }: StoreSnapshot) => {
  if (exists && !etag) {
    throw new Error("The R2 library metadata object is missing an ETag.");
  }

  await putR2ObjectText({
    key: storeKey,
    text: `${JSON.stringify(state, null, 2)}\n`,
    etag: exists ? etag : undefined,
    onlyIfMissing: !exists,
  });
};

const updatePersistedStore = async <T,>(
  updater: (state: PersistedLibraryStore) => {
    state: PersistedLibraryStore;
    result: T;
  }
) => {
  const operation = storeWriteQueue.then(async () => {
    for (let attempt = 0; attempt < maxWriteAttempts; attempt += 1) {
      const snapshot = await readPersistedStore();
      const update = updater(snapshot.state);

      try {
        await writePersistedStore({
          ...snapshot,
          state: update.state,
        });

        return update.result;
      } catch (error) {
        if (
          attempt < maxWriteAttempts - 1 &&
          isR2ConditionalWriteError(error)
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new Error("Could not save the R2 library metadata after retries.");
  });

  storeWriteQueue = operation.then(
    () => undefined,
    () => undefined
  );

  return operation;
};

const getUserBookmarks = (state: PersistedLibraryStore, userId: string) =>
  state.users[userId]?.bookmarks ?? {};

const createUserStore = (state: PersistedLibraryStore, userId: string) => ({
  bookmarks: getUserBookmarks(state, userId),
});

const createLibraryStore = (
  state: PersistedLibraryStore,
  userId: string
): LibraryStore => ({
  bookmarks: Object.fromEntries(
    Object.entries(getUserBookmarks(state, userId)).map(([key, bookmark]) => [
      key,
      withDownloadCount(bookmark, state.downloadCounts),
    ])
  ),
  downloadCounts: state.downloadCounts,
});

export const getLibraryState = async (userId: string): Promise<LibraryStore> => {
  const snapshot = await readPersistedStore();

  return createLibraryStore(snapshot.state, userId);
};

export const getDownloadCounts = async () => {
  const snapshot = await readPersistedStore();

  return snapshot.state.downloadCounts;
};

export const getBookmarkedIssues = async (userId: string) => {
  const state = await getLibraryState(userId);

  return sortIssues(Object.values(state.bookmarks));
};

export const saveBookmark = async (
  userId: string,
  issue: PdfIssue
): Promise<BookmarkRecord> =>
  updatePersistedStore((state) => {
    const userStore = createUserStore(state, userId);
    const bookmark: BookmarkRecord = {
      ...withDownloadCount(issue, state.downloadCounts),
      bookmarkedAt:
        userStore.bookmarks[issue.key]?.bookmarkedAt ??
        new Date().toISOString(),
    };

    return {
      state: {
        ...state,
        users: {
          ...state.users,
          [userId]: {
            ...userStore,
            bookmarks: {
              ...userStore.bookmarks,
              [issue.key]: bookmark,
            },
          },
        },
      },
      result: bookmark,
    };
  });

export const removeBookmark = async (userId: string, key: string) =>
  updatePersistedStore((state) => {
    const normalizedKey = normalizeObjectKey(key);
    const userStore = createUserStore(state, userId);
    const bookmarks = { ...userStore.bookmarks };
    delete bookmarks[normalizedKey];

    return {
      state: {
        ...state,
        users: {
          ...state.users,
          [userId]: {
            ...userStore,
            bookmarks,
          },
        },
      },
      result: normalizedKey,
    };
  });

export const incrementDownloadCount = async (key: string) =>
  updatePersistedStore((state) => {
    const normalizedKey = normalizeObjectKey(key);
    const nextCount = (state.downloadCounts[normalizedKey] ?? 0) + 1;

    return {
      state: {
        ...state,
        downloadCounts: {
          ...state.downloadCounts,
          [normalizedKey]: nextCount,
        },
      },
      result: nextCount,
    };
  });
