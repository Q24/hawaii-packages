export class StorageUtil {

  static storage = sessionStorage;

  /**
   * Storage function to read a key from the sessionStorage
   * @param {string} key
   * @returns {string}
   */
  static read(key: string): string {
    return StorageUtil.storage.getItem(key);
  }

  /**
   * Storage function to store key,value pair to the sessionStorage
   * @param {string} key
   * @param {string} value
   */
  static store(key: string, value: string) {
    StorageUtil.storage.setItem(key, value);
  }

  /**
   * Storage function to remove key from the sessionStorage
   * @param {string} key
   */
  static remove(key: string) {
    StorageUtil.storage.removeItem(key);
  }
}
