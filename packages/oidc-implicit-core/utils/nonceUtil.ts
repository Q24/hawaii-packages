import { StorageUtil } from './storageUtil';
import configService from '../services/config.service';

export class NonceUtil {

  /**
   * Get the saved nonce string from storage
   * @returns {string}
   * @private
   */
  static getNonce(): string | null {
    return StorageUtil.read(`${configService.config.client_id}-nonce`);
  }

  /**
   * Saves the state string to sessionStorage
   * @private
   * @param nonce
   */
  static saveNonce(nonce: string): void {
    StorageUtil.store(`${configService.config.client_id}-nonce`, nonce);
  }

  /**
   * Deletes the nonce from sessionStorage
   * @private
   */
  static deleteNonce(): void {
    StorageUtil.remove('-nonce' +
                         '');
  }

}
