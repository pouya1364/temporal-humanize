import { Temporal } from 'temporal-polyfill';

if (typeof globalThis.Temporal === 'undefined') {
  globalThis.Temporal = Temporal;
}
