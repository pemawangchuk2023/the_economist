import "server-only";

import { auth } from "@clerk/nextjs/server";

export const getAuthenticatedUserId = async () => {
  const { userId } = await auth();

  return userId;
};

export const requireAuthenticatedUserId = async () => {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("Please sign in to access the PDF library.");
  }

  return userId;
};
