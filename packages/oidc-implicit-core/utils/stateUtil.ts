import { StorageUtil } from './storageUtil';
import { LogUtil } from './logUtil';
import { State } from '../models/session.models';
import ConfigService from '../services/config.service';

export class StateUtil {

  /**
   * Get the saved state string from sessionStorage
   * @returns {State}
   * @private
   */
  static getState(): State | null {
    const storedState = JSON.parse(StorageUtil.read(`${ConfigService.config.provider_id}-state`));
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
    StorageUtil.store(`${ConfigService.config.provider_id}-state`, JSON.stringify(state));
  }

  /**
   * Deletes the state from sessionStorage
   * @private
   */
  static deleteState(providerId = `${ConfigService.config.provider_id}`): void {
    LogUtil.debug(`Deleted state: ${providerId}`);
    StorageUtil.remove(`${providerId}-state`);
  }
}