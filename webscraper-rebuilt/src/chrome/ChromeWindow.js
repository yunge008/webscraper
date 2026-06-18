/**
 * Module: ChromeWindow
 * Source module ID: 70905
 * Category: chrome
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

70905: function(e, t, r) {
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
  }), t.ChromeWindow = void 0;
  const i = r(74161),
    o = r(39153);
  class s {
    static create(e) {
      const t = Object.assign(Object.assign({}, this.defaultChromeWindowConfiguration), e);
      return new Promise(((e, r) => {
        chrome.windows.create(t, (t => {
          const n = chrome.runtime.lastError;
          null != n ? (i.Log.error("Chrome window create error", {
            error: o.Err.getMessage(n)
          }), r(`Chrome window create error: ${o.Err.getMessage(n)}`)) : t ? e(t) : r("Chrome window create error: missing window.");
        }));
      }));
    }
    static exists(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield new Promise(((e, t) => {
          chrome.windows.getAll((r => {
            const n = chrome.runtime.lastError;
            if (null != n) {
              const e = o.Err.getMessage(n);
              i.Log.error("Chrome get window list error", {
                error: e
              }), t(`Chrome get window list error ${e}`);
            } else e(r);
          }));
        }));
        for (const r of t)
          if (r.id === e) return !0;
        return !1;
      }));
    }
  }
  t.ChromeWindow = s, s.defaultChromeWindowConfiguration = {
    width: 1042,
    height: 768,
    left: void 0,
    top: void 0
  };
},