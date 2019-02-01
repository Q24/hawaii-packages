export class LogUtil {

  private static emitLog(logType: 'debug' | 'info' | 'warn' | 'error', msg: string, supportingDetails: any[]) {
    if (supportingDetails.length > 0) {
      console[logType](msg, supportingDetails);
    } else {
      console[logType](msg);
    }
  }

  static debug(msg: string, ...supportingDetails: any[]): void {
    LogUtil.emitLog('debug', msg, supportingDetails);
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
}
