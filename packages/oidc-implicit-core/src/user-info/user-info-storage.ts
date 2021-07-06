import { StorageUtil } from "../utils/storageUtil";
import { UserInfo } from "./UserInfo.model";

const userInfoStorageKey = "userInfo";

export const getStoredUserInfo = (): UserInfo | null => {
  const userInfoString = StorageUtil.read(userInfoStorageKey);
  if (!userInfoString) {
    return null;
  }
  return JSON.parse(userInfoString);
};
export const setStoredUserInfo = (userInfo: UserInfo): void =>
  StorageUtil.store(userInfoStorageKey, JSON.stringify(userInfo));

export const deleteStoredUserInfo = (): void => {
  StorageUtil.remove(userInfoStorageKey);
};
