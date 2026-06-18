/**
 * Module: Err
 * Source module ID: 39153
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

39153: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Err = void 0;
  const n = r(74161);
  class i {
    static getMessage(e) {
      if ("string" == typeof e) return e;
      if (e && "object" == typeof e && e.message && "string" == typeof e.message) {
        let t = e.message;
        return e.cause && e.cause.message && (t += ` ${e.cause.message}`), t;
      }
      return null == e ? "missing error" : "object" == typeof e ? JSON.stringify(e) : e.toString();
    }
    static startsWith(e, t) {
      return "string" == typeof e ? e.startsWith(t) : !(!e || "object" != typeof e || !e.message || "string" != typeof e.message) && e.message.startsWith(t);
    }
    static startsWithAnyOf(e, t) {
      for (const r of t)
        if (i.startsWith(e, r)) return !0;
      return !1;
    }
    static includesAnyOf(e, t) {
      for (const r of t)
        if (i.includes(e, r)) return !0;
      return !1;
    }
    static includes(e, t) {
      if (null == e) return !1;
      return i.getMessage(e).includes(t);
    }
    static handleUIPromiseError(e, t) {
      return r => {
        n.Log.notice(`Unhandled promise rejection: ${e}`, Object.assign({
          error: i.getMessage(r)
        }, t));
      };
    }
    static getStack(e) {
      return e && e.stack ? e.stack : void 0;
    }
  }
  t.Err = i;
},