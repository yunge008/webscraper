/**
 * Module: SelectorLink
 * Source module ID: 41112
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

41112: function(e, t, r) {
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
  }), t.SelectorLink = void 0;
  const s = r(90711),
    a = r(93772),
    l = r(9103),
    c = r(51762),
    u = r(3791),
    d = r(81799),
    h = r(16448);
  class f extends s.Selector {
    constructor(e, t = !1) {
      super(), this.type = "SelectorLink", this.selector = "", this.multiple = !1, this.version = void 0,
        t && (this.linkType = e.linkType || "linkFromHref", e.version = 2), this.updateData(e, t);
    }
    canReturnMultipleRecords() {
      return !0;
    }
    canHaveChildSelectors() {
      return !0;
    }
    canCreateNewJobs() {
      return !0;
    }
    willReturnElements() {
      return !1;
    }
    _getData(e) {
      return o(this, arguments, (function*() {
        var t, r, o, s;
        const a = yield n(this.getDataElements(e)), l = this.getLinkExtractorStrategy(), c = {
          id: this.id,
          dataElements: a
        };
        !1 === this.multiple && 0 === a.length && (yield yield n(this.getEmptyRecord()));
        try {
          for (var u, d = !0, h = i(l.extract(c)); !(t = (u = yield n(h.next())).done); d = !0) {
            s = u.value, d = !1;
            const e = s,
              t = {
                _followSelectorId: e._followSelectorId,
                _follow: e._follow
              };
            this.version && 1 !== this.version ? t[this.id] = e[this.id] : (t[this.id] = e._text,
              t[`${this.id}-href`] = e[this.id]), yield yield n(t);
          }
        } catch (e) {
          r = {
            error: e
          };
        } finally {
          try {
            d || t || !(o = h.return) || (yield n(o.call(h)));
          } finally {
            if (r) throw r.error;
          }
        }
      }));
    }
    getDataColumns() {
      return this.version && 1 !== this.version ? [this.id] : [this.id, `${this.id}-href`];
    }
    getFeatures() {
      return ["selector", "multiple", "linkType"];
    }
    getHiddenFeatures() {
      return ["version"];
    }
    isLinkSelector() {
      return !0;
    }
    getSelectorsForOptimization() {
      return ["selector"];
    }
    getLinkExtractorStrategy() {
      switch (this.linkType) {
        case void 0:
        case "linkFromHref":
          return new a.LinkExtractorStrategy(new l.LinkFromHrefExtractor);

        case "linkFromInlineScript":
          return new a.LinkExtractorStrategy(new c.LinkFromInlineScriptExtractor);

        case "linkFromAttributes":
          return new a.LinkExtractorStrategy(new u.LinkFromAttributesExtractor);

        case "linkFromInnerText":
          return new a.LinkExtractorStrategy(new d.LinkFromInnerTextExtractor);

        case "linkFromRedirect":
          return new a.LinkExtractorStrategy(new h.LinkFromRedirectExtractor);

        default:
          throw new Error(`Unknown link type ${this.linkType}`);
      }
    }
  }
  t.SelectorLink = f;
},