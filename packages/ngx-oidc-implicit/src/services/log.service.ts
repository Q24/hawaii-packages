import {Log} from '../models';
import {Injectable} from '@angular/core';

@Injectable()
export class LogService implements Log {

  public debug(msg: string, ...supportingDetails: any[]): void {
    LogService._emitLog('debug', msg, supportingDetails);
  }

  public info(msg: string, ...supportingDetails: any[]): void {
    LogService._emitLog('info', msg, supportingDetails);
  }

  public warn(msg: string, ...supportingDetails: any[]): void {
    LogService._emitLog('warn', msg, supportingDetails);
  }

  public error(msg: string, ...supportingDetails: any[]): void {
    LogService._emitLog('error', msg, supportingDetails);
  }


  private static _emitLog(logType: 'debug' | 'info' | 'warn' | 'error', msg: string, supportingDetails: any[]) {
    if (supportingDetails.length > 0) {
      console[logType](msg, supportingDetails);
    } else {
      console[logType](msg);
    }
  }
}
