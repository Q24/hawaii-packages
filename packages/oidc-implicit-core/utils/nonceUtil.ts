import { StorageUtil } from './storageUtil';
import ConfigService from '../services/config.service';

export class NonceUtil {

  /**
   * Get the saved nonce string from storage
   * @returns {string}
   * @private
   */
  static getNonce(): string | null {
    return StorageUtil.read(`${ConfigService.config.provider_id}-nonce`);
  }

  /**
   * Saves the state string to sessionStorage
   * @private
   * @param nonce
   */
  static saveNonce(nonce: string): void {
    StorageUtil.store(`${ConfigService.config.provider_id}-nonce`, nonce);
  }

  /**
   * Deletes the nonce from sessionStorage
   * @private
   */
  static deleteNonce(providerId = `${ConfigService.config.provider_id}`): void {
    StorageUtil.remove(`${providerId}-nonce`);
  }

}
