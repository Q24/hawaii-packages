import { StorageUtil } from "../utils/storageUtil";
import { UserInfo } from "./UserInfo.model";

const userInfoStorageKey = "userInfo";

export const getStoredUserInfo = (): UserInfo => {
  const userInfoString = StorageUtil.read(userInfoStorageKey);
  return JSON.parse(userInfoString);
};
export const setStoredUserInfo = (userInfo: UserInfo): void =>
  StorageUtil.store(userInfoStorageKey, JSON.stringify(userInfo));

export const deleteStoredUserInfo = (): void => {
  StorageUtil.remove(userInfoStorageKey);
};
