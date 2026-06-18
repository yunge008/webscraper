/**
 * Module: ExtensionUpdate
 * Source module ID: 71562
 * Category: background
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

71562: function(e, t, r) {
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
  }), t.ExtensionUpdate = void 0;
  const i = r(72328);
  class o {
    static init() {
      chrome.runtime.onInstalled.addListener(o.handleUpdate);
    }
    static handleUpdate(e) {
      return n(this, arguments, void 0, (function*({
        reason: e
      }) {
        if ("update" !== e) return;
        const t = new i.SitemapRepository,
          r = yield t.getAll();
        for (const e of r) e.setHashHistory(), yield t.update(e);
      }));
    }
  }
  t.ExtensionUpdate = o;
},