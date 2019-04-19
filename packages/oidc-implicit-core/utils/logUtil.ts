import ConfigService from '../services/config.service';

export class LogUtil {

  static debug(msg: string, ...supportingDetails: any[]): void {
    LogUtil.emitLog('log', msg, supportingDetails);
  }

  static info(msg: string, ...supportingDetails: any[]): void {
    LogUtil.emitLog('info', msg, supportingDetails);
  }

  static warn(msg: string, ...supportingDetails: any[]): void {
    LogUtil.emitLog('warn', msg, supportingDetails);
  }

  static error(msg: string, ...supportingDetails: any[]): void {
    LogUtil.emitLog('error', msg, supportingDetails);
  }

  private static emitLog(logType: 'log' | 'info' | 'warn' | 'error', msg: string, supportingDetails: any[]) {

    if (ConfigService.config.debug) {
      if (supportingDetails.length > 0) {
        console[logType](msg, supportingDetails);
      } else {
        console[logType](msg);
      }
    }
  }
}
