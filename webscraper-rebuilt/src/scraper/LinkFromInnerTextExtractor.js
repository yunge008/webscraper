/**
 * Module: LinkFromInnerTextExtractor
 * Source module ID: 81799
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

81799: function(e, t, r) {
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
  }), t.LinkFromInnerTextExtractor = void 0;
  const i = r(78171),
    o = r(90195);
  t.LinkFromInnerTextExtractor = class {
    execute(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield e.getText();
        if (!t) return;
        const r = (new i.LinksFromTextExtractor).extract(t);
        return r.length > 0 ? o.Url.combine(yield e.getPageUrl(), r[0]) : void 0;
      }));
    }
  };
},