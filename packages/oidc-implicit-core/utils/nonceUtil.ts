import { CONFIG } from '../constants/config.constants';
import { StorageUtil } from './storageUtil';

export class NonceUtil {

  /**
   * Get the saved nonce string from storage
   * @returns {string}
   * @private
   */
  static getNonce(): string | null {
    return StorageUtil.read(`${CONFIG.provider_id}-nonce`);
  }

  /**
   * Saves the state string to sessionStorage
   * @private
   * @param nonce
   */
  static saveNonce(nonce: string): void {
    StorageUtil.store(`${CONFIG.provider_id}-nonce`, nonce);
  }

  /**
   * Deletes the nonce from sessionStorage
   * @private
   */
  static deleteNonce(providerId = `${CONFIG.provider_id}`): void {
    StorageUtil.remove(`${providerId}-nonce`);
  }

}
