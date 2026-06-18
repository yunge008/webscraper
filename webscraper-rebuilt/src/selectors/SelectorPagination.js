/**
 * Module: SelectorPagination
 * Source module ID: 46568
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

46568: function(e, t, r) {
  "use strict";
  var n = this && this.__await || function(e) {
      return this instanceof n ? (this.v = e, this) : new n(e);
    },
    i = this && this.__asyncValues || function(e) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var t, r = e[Symbol.asyncIterator];
      return r ? r.call(e) : (e = "function" == typeof __values ? __values(e) : e[Symbol.iterator](),
        t = {}, n("next"), n("throw"), n("return"), t[Symbol.asyncIterator] = function() {
          return this;
        }, t);

      function n(r) {
        t[r] = e[r] && function(t) {
          return new Promise((function(n, i) {
            (function(e, t, r, n) {
              Promise.resolve(n).then((function(t) {
                e({
                  value: t,
                  done: r
                });
              }), t);
            })(n, i, (t = e[r](t)).done, t.value);
          }));
        };
      }
    },
    o = this && this.__asyncGenerator || function(e, t, r) {
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
  }), t.SelectorPagination = void 0;
  const s = r(90711),
    a = r(9103),
    l = r(81799),
    c = r(3791),
    u = r(51762),
    d = r(23646),
    h = r(82751),
    f = r(2113),
    p = r(16448),
    m = r(17747);
  class g extends s.Selector {
    constructor(e) {
      super(), this.paginationType = "auto", this.type = "SelectorPagination", delete e.multiple,
        this.maxPages = "" === e.maxPages || void 0 === e.maxPages ? 0 : parseInt(e.maxPages, 10) || 0,
        this.updateData(e), this.parentSelectors.includes(this.id) || this.parentSelectors.push(this.id);
    }
    canCreateNewJobs() {
      return !0;
    }
    canHaveChildSelectors() {
      return !0;
    }
    canReturnMultipleRecords() {
      return !0;
    }
    willReturnMultipleRecords() {
      return !0;
    }
    getDataColumns() {
      return "clickMore" === this.paginationType || "clickOnce" === this.paginationType ? [] : [this.id];
    }
    getFeatures() {
      return ["selector", "paginationType", "maxPages"];
    }
    willReturnElements() {
      return !1;
    }
    shouldDeduplicateChildSelectorData() {
      return !0;
    }
    getDeduplicator(e) {
      return new m.SelectorPaginationDataDeduplicator(e);
    }
    _getData(e, t) {
      return o(this, arguments, (function*() {
        var r, o, s, a;
        const l = yield n(e.getElements(this.selector)), c = this.getPaginationStrategies(), u = {
          id: this.id,
          selector: this.selector,
          maxPages: this.maxPages,
          parentElement: e,
          dataDeduplicator: t,
          dataElements: l
        };
        yield yield n(u.parentElement);
        for (const e of c) {
          let t = !1;
          try {
            for (var d, h = !0, f = (o = void 0, i(e.extract(u))); !(r = (d = yield n(f.next())).done); h = !0) {
              a = d.value, h = !1;
              const e = a;
              t = !0, yield yield n(e);
            }
          } catch (e) {
            o = {
              error: e
            };
          } finally {
            try {
              h || r || !(s = f.return) || (yield n(s.call(f)));
            } finally {
              if (o) throw o.error;
            }
          }
          if (t) return yield n(void 0);
        }
      }));
    }
    getSelectorsForOptimization() {
      return ["selector"];
    }
    getPaginationStrategies() {
      switch (this.paginationType) {
        case "auto":
          return [new d.PaginationLinkExtractorStrategy(new a.LinkFromHrefExtractor), new d.PaginationLinkExtractorStrategy(new u.LinkFromInlineScriptExtractor), new d.PaginationLinkExtractorStrategy(new c.LinkFromAttributesExtractor), new h.ClickMoreElementExtractorStrategy];

        case "linkFromHref":
          return [new d.PaginationLinkExtractorStrategy(new a.LinkFromHrefExtractor)];

        case "linkFromInlineScript":
          return [new d.PaginationLinkExtractorStrategy(new u.LinkFromInlineScriptExtractor)];

        case "linkFromAttributes":
          return [new d.PaginationLinkExtractorStrategy(new c.LinkFromAttributesExtractor)];

        case "linkFromInnerText":
          return [new d.PaginationLinkExtractorStrategy(new l.LinkFromInnerTextExtractor)];

        case "linkFromRedirect":
          return [new d.PaginationLinkExtractorStrategy(new p.LinkFromRedirectExtractor)];

        case "clickMore":
          return [new h.ClickMoreElementExtractorStrategy];

        case "clickOnce":
          return [new f.ClickOnceExtractorStrategy];

        default:
          throw new Error(`Unknown pagination type ${this.paginationType}`);
      }
    }
  }
  t.SelectorPagination = g;
},
