import { parse } from 'parse-duration';

import debug from 'debug';

debug.enable('bot:*');

// DEBUG PREPARE
// ----------------------------------------------------------------------------
export const log = {
  // tslint:disable-next-line: no-unbound-method
  error: debug('bot:error'),
  // tslint:disable-next-line: no-unbound-method
  event: debug('bot:event'),
  // tslint:disable-next-line: no-unbound-method
  system: debug('bot:system'),
  // tslint:disable-next-line: no-unbound-method
  warn: debug('bot:warn')
};

export function isURL(str: string): boolean {
  const pattern = new RegExp(
    '^((https|http):\\/\\/)' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return pattern.test(str);
}

export function isYoutubeURL(url: string): boolean {
  const p = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;
  if (url.match(p)) {
    return true;
  }
  return false;
}

export interface ParsedArgs {
  readonly args: string;
  readonly options: any;
}

export function argsParser(args: string): ParsedArgs {
  const opts = args.substring(args.lastIndexOf('{') + 1, args.lastIndexOf('}'));

  const o: any = {};
  opts
    .split(' ')
    .filter(el => {
      return el !== '';
    })
    .forEach(el => {
      if (el.includes(':')) {
        const ell = el.split(':');
        o[ell[0]] = ell[1];
      } else {
        o[el] = true;
      }
    });
  return {
    args: args.replace(`{${opts}}`, ''),
    options: o
  };
}

export function arrHas(arr: readonly string[], val: string): boolean {
  return arr.includes(val);
}

export function strHas(str: string, sub: string): boolean {
  return str.includes(sub);
}

export function between(x: number, min: number, max: number): boolean {
  return x >= min && x <= max;
}

export function seconds2time(sec: number): string {
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec - days * 86400) / 3600);
  const minutes = Math.floor((sec - hours * 3600 - days * 86400) / 60);
  const seconds = sec - hours * 3600 - minutes * 60 - days * 86400;
  let time: string = '';

  if (days !== 0) {
    time = String(days) + 'd ';
  }
  if (hours !== 0 || time !== '') {
    time +=
      (hours < 10 && time !== '' ? '0' + String(hours) : String(hours)) + ':';
  }
  if (minutes !== 0 || time !== '') {
    time +=
      (minutes < 10 && time !== '' ? '0' + String(minutes) : String(minutes)) +
      ':';
  }
  if (time === '') {
    time = String(seconds) + 's';
  } else {
    time += seconds < 10 ? '0' + String(seconds) : String(seconds);
  }
  return time;
}

export function ytDuration2seconds(duration: string): number {
  let seconds = 0;
  const parsingFlags = ['s', 'm', 'h', 'd'];
  const _d = duration.split(':').reverse();
  for (let i = 0; i < _d.length; i++) {
    seconds += parse(_d[i] + parsingFlags[i]) / 1000;
  }
  return seconds;
}
