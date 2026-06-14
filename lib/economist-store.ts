import "server-only";

import { promises as fs } from "fs";
import path from "path";

import { DEFAULT_READING_STATUS, sortIssues } from "@/lib/economist";
import type {
  BookmarkRecord,
  LibraryStore,
  PdfIssue,
  ReadingStatus,
} from "@/types/economist";

const storePath = path.join(process.cwd(), "data", "economist-library.json");

let storeWriteQueue = Promise.resolve();

const createEmptyStore = (): LibraryStore => ({
  bookmarks: {},
  readingStatuses: {},
});

const normalizeStore = (value: unknown): LibraryStore => {
  if (!value || typeof value !== "object") {
    return createEmptyStore();
  }

  const store = value as Partial<LibraryStore>;

  return {
    bookmarks: store.bookmarks ?? {},
    readingStatuses: store.readingStatuses ?? {},
  };
};

export const getLibraryState = async (): Promise<LibraryStore> => {
  try {
    const rawStore = await fs.readFile(storePath, "utf8");
    return normalizeStore(JSON.parse(rawStore));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createEmptyStore();
    }

    throw error;
  }
};

const writeLibraryState = async (state: LibraryStore) => {
  await fs.mkdir(path.dirname(storePath), { recursive: true });

  const tempPath = `${storePath}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await fs.rename(tempPath, storePath);
};

const updateLibraryState = async <T,>(
  updater: (state: LibraryStore) => { state: LibraryStore; result: T }
) => {
  const operation = storeWriteQueue.then(async () => {
    const currentState = await getLibraryState();
    const update = updater(currentState);
    await writeLibraryState(update.state);
    return update.result;
  });

  storeWriteQueue = operation.then(
    () => undefined,
    () => undefined
  );

  return operation;
};

export const getBookmarkedIssues = async () => {
  const state = await getLibraryState();
  return sortIssues(Object.values(state.bookmarks));
};

export const saveBookmark = async (issue: PdfIssue): Promise<BookmarkRecord> =>
  updateLibraryState((state) => {
    const bookmark: BookmarkRecord = {
      ...issue,
      bookmarkedAt:
        state.bookmarks[issue.key]?.bookmarkedAt ?? new Date().toISOString(),
    };

    return {
      state: {
        ...state,
        bookmarks: {
          ...state.bookmarks,
          [issue.key]: bookmark,
        },
      },
      result: bookmark,
    };
  });

export const removeBookmark = async (key: string) =>
  updateLibraryState((state) => {
    const bookmarks = { ...state.bookmarks };
    delete bookmarks[key];

    return {
      state: {
        ...state,
        bookmarks,
      },
      result: key,
    };
  });

export const saveReadingStatus = async (
  key: string,
  status: ReadingStatus
) =>
  updateLibraryState((state) => {
    const readingStatuses = { ...state.readingStatuses };

    if (status === DEFAULT_READING_STATUS) {
      delete readingStatuses[key];
    } else {
      readingStatuses[key] = status;
    }

    return {
      state: {
        ...state,
        readingStatuses,
      },
      result: status,
    };
  });
