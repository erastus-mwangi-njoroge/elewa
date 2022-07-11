import { Logger } from './logger.interface';

/**
 * Simple wrapper around console.log.
 * Class used for production logging. Hide debug info, errors and warnings from hackers.
 */
export class ConsoleProductionLogger implements Logger
{
  log(msg: () => any) { console.log(this._toStr(msg())) }

  debug(msg: () => any) { console.debug(this._toStr(msg())); }
  warn(msg: () => any)  { console.warn(this._toStr(msg())); }
  error(msg: () => any) { console.error(this._toStr(msg())); }

  private _toStr = (x: any) => x instanceof String ? x : JSON.stringify(x);
}
