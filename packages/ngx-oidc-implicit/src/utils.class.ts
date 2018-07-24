export default class Utils {
  /**
   * Return the current time in seconds since 1970
   * @returns {number}
   */
  static epoch(): number {
    return Math.round(new Date().getTime() / 1000.0);
  }

  /**
   * Generates a random 'state' string
   * @returns {string}
   */
  static generateState(): string {

    let text = '';
    const possible = '0123456789';

    for (let i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
      text += possible.charAt(Math.floor(Math.random() * possible.length));
      text += possible.charAt(Math.floor(Math.random() * possible.length));
      text += '-';
      text += possible.charAt(Math.floor(Math.random() * possible.length));
      text += possible.charAt(Math.floor(Math.random() * possible.length));
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * Generates a random 'nonce' string
   * @returns {string}
   */
  static generateNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 25; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

}
