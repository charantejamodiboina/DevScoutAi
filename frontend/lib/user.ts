export const USER_ID_STORAGE_KEY = "devscout_user_id";

export function getUserId(): string {
  if (typeof window === "undefined") {
    throw new Error("getUserId must run in the browser");
  }

  let userId = localStorage.getItem(USER_ID_STORAGE_KEY);

  if (!userId) {
    userId = crypto.randomUUID();

    localStorage.setItem(
      USER_ID_STORAGE_KEY,
      userId
    );
  }

  return userId;
}