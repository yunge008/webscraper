/**
 * Module: ClickMoreElementExtractorStrategy
 * Source module ID: 82751
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

82751: function(e, t, r) {
  "use strict";
  var n = this && this.__await || function(e) {
      return this instanceof n ? (this.v = e, this) : new n(e);
    },
    i = this && this.__asyncGenerator || function(e, t, r) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var i, o = r.apply(e, t || []),
        s = [];
      return i = Object.create(("function" == typeof AsyncIterator ? AsyncIterator : Object).prototype),
        a("next"), a("throw"), a("return", (function(e) {
          return function(t) {
            return Promise.resolve(t).then(e, u);
          };
        })), i[Symbol.asyncIterator] = function() {
          return this;
        }, i;

      function a(e, t) {
        o[e] && (i[e] = function(t) {
          return new Promise((function(r, n) {
            s.push([e, t, r, n]) > 1 || l(e, t);
          }));
        }, t && (i[e] = t(i[e])));
      }

      function l(e, t) {
        try {
          (r = o[e](t)).value instanceof n ? Promise.resolve(r.value.v).then(c, u) : d(s[0][2], r);
        } catch (e) {
          d(s[0][3], e);
        }
        var r;
      }

      function c(e) {
        l("next", e);
      }

      function u(e) {
        l("throw", e);
      }

      function d(e, t) {
        e(t), s.shift(), s.length && l(s[0][0], s[0][1]);
      }
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ClickMoreElementExtractorStrategy = void 0;
  const o = r(94341),
    s = r(94606),
    a = r(95845),
    l = r(83258);
  class c extends a.BaseClickPaginationStrategy {
    extract(e) {
      return i(this, arguments, (function*() {
        const {
          dataDeduplicator: t,
          selector: r,
          maxPages: c
        } = e;
        if (e.parentElement.isJsDisabled()) return yield n(void 0);
        const i = e.parentElement,
          a = new o.UniqueElementList("uniqueText");
        let u = 1;
        for (;;) {
          if (c > 0 && u >= c) break;
          const e = yield n(this.getClickButton(i, r, a));
          if (!e) break;
          yield n(e.click(s.ClickActionTypes.realLikeEvents)), yield n(this.waitForPageToLoadAfterClick(i)),
            u++,
            yield yield n(i), t.lastBatchIsDuplicate() && (yield n(l.Async.sleep(1e3)), yield yield n(i),
              t.lastBatchIsDuplicate() && (yield n(a.push(e))));
        }
      }));
    }
  }
  t.ClickMoreElementExtractorStrategy = c;
},
