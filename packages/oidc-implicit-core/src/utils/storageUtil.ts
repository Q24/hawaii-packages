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
  static store(key: string, value: string): void {
    StorageUtil.storage.setItem(key, value);
  }

  /**
   * Storage function to remove key(s) from the sessionStorage
   * @param regexString
   */
  static remove(regexString: string): void {

    const regex = new RegExp(regexString);

    Object.keys(StorageUtil.storage)
      .filter(key => regex.test(key))
      .forEach(key => StorageUtil.storage.removeItem(key));
  }
}
