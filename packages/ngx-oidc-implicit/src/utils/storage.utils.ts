export class StorageUtils {

  static storage = sessionStorage;

  /**
   * Storage function to read a key from the sessionStorage
   * @param {string} key
   * @returns {string}
   */
  static read(key: string): string {
    return StorageUtils.storage.getItem(key);
  }

  /**
   * Storage function to store key,value pair to the sessionStorage
   * @param {string} key
   * @param {string} value
   */
  static store(key: string, value: string) {
    StorageUtils.storage.setItem(key, value);
  }

  /**
   * Storage function to remove key from the sessionStorage
   * @param {string} key
   */
  static remove(key: string) {
    StorageUtils.storage.removeItem(key);
  }
}
