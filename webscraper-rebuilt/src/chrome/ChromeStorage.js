/**
 * Module: ChromeStorage
 * Source module ID: 69444
 * Category: chrome
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

69444: function(e, t, r) {
  "use strict";
  var n = this && this.__awaiter || function(e, t, r, n) {
    return new(r || (r = Promise))((function(i, o) {
      function s(e) {
        try {
          l(n.next(e));
        } catch (e) {
          o(e);
        }
      }

      function a(e) {
        try {
          l(n.throw(e));
        } catch (e) {
          o(e);
        }
      }

      function l(e) {
        var t;
        e.done ? i(e.value) : (t = e.value, t instanceof r ? t : new r((function(e) {
          e(t);
        }))).then(s, a);
      }
      l((n = n.apply(e, t || [])).next());
    }));
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ChromeStorage = void 0;
  const i = r(39153);
  t.ChromeStorage = class {
    static getFromStorage(e, t) {
      return n(this, void 0, void 0, (function*() {
        return new Promise(((r, n) => {
          chrome.storage[e].get(t, (o => {
            const s = chrome.runtime.lastError;
            null != s ? n(`Chrome storage ${e} get error ${i.Err.getMessage(s)}`) : r(o[t]);
          }));
        }));
      }));
    }
    static setInStorage(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        const n = {
          [t]: r
        };
        yield new Promise(((t, r) => {
          chrome.storage[e].set(n, (() => {
            const n = chrome.runtime.lastError;
            null != n ? r(`Chrome storage ${e} set error ${i.Err.getMessage(n)}`) : t();
          }));
        }));
      }));
    }
    static removeFromStorage(e, t) {
      return n(this, void 0, void 0, (function*() {
        yield new Promise(((r, n) => {
          chrome.storage[e].remove(t, (() => {
            const t = chrome.runtime.lastError;
            null != t ? n(`Chrome storage ${e} remove error ${i.Err.getMessage(t)}`) : r();
          }));
        }));
      }));
    }
  };
},