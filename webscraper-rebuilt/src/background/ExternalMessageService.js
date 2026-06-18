/**
 * Module: ExternalMessageService
 * Source module ID: 67369
 * Category: background
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

67369: function(e, t, r) {
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
  }), t.ExternalMessageService = void 0;
  const i = r(74161),
    o = r(28760),
    s = r(75041);
  class a {
    static init() {
      i.Log.info("External cloud message listener disabled in rebuilt extension");
    }
    static handleFirefoxMessage(e) {
      return n(this, void 0, void 0, (function*() {
        try {
          yield a.handleMessage(e);
        } catch (t) {
          return i.Log.error(t.message), {
            messageId: e.messageId,
            success: !1,
            error: t.message
          };
        }
        return {
          messageId: e.messageId,
          success: !0
        };
      }));
    }
    static handleExternalMessage(e, t, r) {
      return a.handleMessage(e).then((e => {
        r({
          success: !0,
          response: e
        });
      })).catch((e => {
        i.Log.error(e.message), r({
          success: !1,
          error: e.message
        });
      })), !0;
    }
    static handleMessage(e) {
      return n(this, void 0, void 0, (function*() {
        switch (e.type) {
          case "ping":
            return "pong";

          default:
            throw new Error("Cloud integration is disabled in this rebuilt extension.");
        }
      }));
    }
  }
  t.ExternalMessageService = a;
},
