export class StorageService {

  static storage = sessionStorage;

  /**
   * Storage function to read a key from the sessionStorage
   * @param {string} key
   * @returns {string}
   */
  public read(key: string): string {
    return this.storage.getItem(key);
  }

  /**
   * Storage function to store key,value pair to the sessionStorage
   * @param {string} key
   * @param {string} value
   */
   public store(key: string, value: string) {
    this.storage.setItem(key, value);
  }

  /**
   * Storage function to remove key from the sessionStorage
   * @param {string} key
   */
  public remove(key: string) {
    this.storage.removeItem(key);
  }



}
