import { StorageUtil } from './storageUtil';
import { LogUtil } from './logUtil';
import { State } from '../models/session.models';
import { CONFIG } from '../constants/config.constants';

export class StateUtil {

  /**
   * Get the saved state string from sessionStorage
   * @returns {State}
   * @private
   */
  static getState(): State | null {
    const storedState = JSON.parse(StorageUtil.read(`${CONFIG.provider_id}-state`));
    LogUtil.debug('Got state from storage', storedState);
    return storedState;
  }

  /**
   * Saves the state string to sessionStorage
   * @param {State} state
   * @private
   */
  static saveState(state: State): void {
    LogUtil.debug('State saved');
    StorageUtil.store(`${CONFIG.provider_id}-state`, JSON.stringify(state));
  }

  /**
   * Deletes the state from sessionStorage
   * @private
   */
  static deleteState(providerId = `${CONFIG.provider_id}`): void {
    LogUtil.debug(`Deleted state: ${providerId}`);
    StorageUtil.remove(`${providerId}-state`);
  }
}
