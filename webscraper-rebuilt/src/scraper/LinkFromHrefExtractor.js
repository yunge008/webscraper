/**
 * Module: LinkFromHrefExtractor
 * Source module ID: 9103
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

9103: function(e, t, r) {
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
  }), t.LinkFromHrefExtractor = void 0;
  const i = r(90195);
  t.LinkFromHrefExtractor = class {
    execute(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield e.getProp("href"), r = yield e.getPageUrl();
        if (i.Url.isRecognizedProtocol(t) && (!i.Url.isHashTagChange(r, t) || !t.endsWith("#"))) return t.match(/^https?:\/\//) ? t : i.Url.combine(r, t);
      }));
    }
  };
},