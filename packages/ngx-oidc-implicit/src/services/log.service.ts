import { Log } from '../models';
import { Injectable } from '@angular/core';

@Injectable()
export class LogService implements Log {

  private static emitLog(logType: 'debug' | 'info' | 'warn' | 'error', msg: string, supportingDetails: any[]) {
    if (supportingDetails.length > 0) {
      console[logType](msg, supportingDetails);
    } else {
      console[logType](msg);
    }
  }

  public debug(msg: string, ...supportingDetails: any[]): void {
    LogService.emitLog('debug', msg, supportingDetails);
  }

  public info(msg: string, ...supportingDetails: any[]): void {
    LogService.emitLog('info', msg, supportingDetails);
  }

  public warn(msg: string, ...supportingDetails: any[]): void {
    LogService.emitLog('warn', msg, supportingDetails);
  }

  public error(msg: string, ...supportingDetails: any[]): void {
    LogService.emitLog('error', msg, supportingDetails);
  }
}
