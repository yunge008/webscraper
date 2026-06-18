/**
 * Module: BaseClickPaginationStrategy
 * Source module ID: 95845
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

95845: function(e, t, r) {
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
  }), t.BaseClickPaginationStrategy = void 0;
  const i = r(12047),
    o = r(70259);
  class s extends i.BasePaginationStrategy {
    getClickButton(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        const n = yield e.getElements(t);
        for (const e of n) {
          if (!(yield r.isElementAdded(e))) return e;
        }
      }));
    }
    waitForPageToLoadAfterClick(e) {
      return n(this, void 0, void 0, (function*() {
        yield e.waitForPageLoadComplete(2 * o.TIME.ONE_SECOND_MS, !0);
      }));
    }
  }
  t.BaseClickPaginationStrategy = s;
},