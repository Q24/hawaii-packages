import {Log} from '../models';

export class LogUtils implements Log {

  public debug(msg: string, ...supportingDetails: any[]): void {
    this._emitLog('debug', msg, supportingDetails);
  }

  public info(msg: string, ...supportingDetails: any[]): void {
    this._emitLog('info', msg, supportingDetails);
  }

  public warn(msg: string, ...supportingDetails: any[]): void {
    this._emitLog('warn', msg, supportingDetails);
  }

  public error(msg: string, ...supportingDetails: any[]): void {
    this._emitLog('error', msg, supportingDetails);
  }


  private _emitLog(logType: 'debug' | 'info' | 'warn' | 'error', msg: string, supportingDetails: any[]) {
    if (supportingDetails.length > 0) {
      console[logType](msg, supportingDetails);
    } else {
      console[logType](msg);
    }
  }
}
