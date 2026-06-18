/**
 * Module: SelectorElement
 * Source module ID: 10726
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

10726: function(e, t, r) {
  "use strict";
  var n = this && this.__asyncValues || function(e) {
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
    i = this && this.__await || function(e) {
      return this instanceof i ? (this.v = e, this) : new i(e);
    },
    o = this && this.__asyncDelegator || function(e) {
      var t, r;
      return t = {}, n("next"), n("throw", (function(e) {
        throw e;
      })), n("return"), t[Symbol.iterator] = function() {
        return this;
      }, t;

      function n(n, o) {
        t[n] = e[n] ? function(t) {
          return (r = !r) ? {
            value: i(e[n](t)),
            done: !1
          } : o ? o(t) : t;
        } : o;
      }
    },
    s = this && this.__asyncGenerator || function(e, t, r) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var n, o = r.apply(e, t || []),
        s = [];
      return n = Object.create(("function" == typeof AsyncIterator ? AsyncIterator : Object).prototype),
        a("next"), a("throw"), a("return", (function(e) {
          return function(t) {
            return Promise.resolve(t).then(e, u);
          };
        })), n[Symbol.asyncIterator] = function() {
          return this;
        }, n;

      function a(e, t) {
        o[e] && (n[e] = function(t) {
          return new Promise((function(r, n) {
            s.push([e, t, r, n]) > 1 || l(e, t);
          }));
        }, t && (n[e] = t(n[e])));
      }

      function l(e, t) {
        try {
          (r = o[e](t)).value instanceof i ? Promise.resolve(r.value.v).then(c, u) : d(s[0][2], r);
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
  }), t.SelectorElement = void 0;
  const a = r(90711),
    l = r(74161),
    c = r(71187);
  class u extends a.Selector {
    constructor(e) {
      super(), this.type = "SelectorElement", this.selector = "", this.multiple = !0,
        this.scroll = !1, this.elementLimit = 0, "string" == typeof e.elementLimit && "" === e.elementLimit && (e.elementLimit = 0),
        this.updateData(e);
    }
    canReturnMultipleRecords() {
      return !0;
    }
    canHaveChildSelectors() {
      return !0;
    }
    canCreateNewJobs() {
      return !1;
    }
    willReturnElements() {
      return !0;
    }
    _getData(e, t) {
      return s(this, arguments, (function*() {
        this.multiple && this.scroll ? yield i(yield* o(n(this.extractWithScroll(e, t)))): yield i(yield* o(n(this.extract(e))));
      }));
    }
    getDataColumns() {
      return [];
    }
    getFeatures() {
      return ["selector", "multiple", "scroll"];
    }
    getDeduplicator() {
      return new c.SelectorElementDeduplicator;
    }
    getHiddenFeatures() {
      return ["elementLimit"];
    }
    getSelectorsForOptimization() {
      return ["selector"];
    }
    extract(e) {
      return s(this, arguments, (function*() {
        const t = yield i(this.getDataElements(e));
        for (const e of t) yield yield i(e);
      }));
    }
    extractWithScroll(e, t) {
      return s(this, arguments, (function*() {
        yield i(e.waitForPageLoadComplete(0));
        let r = yield i(e.findScrollableParentElement([this.selector]));
        const s = yield i(e.getDocumentScrollingElementReference());
        let a = [];
        let c = -20;
        for (yield i(yield* o(n(this.extract(e)))), t.advanceScroll();;) {
          yield i(e.scrollDownViewport(r)), yield i(e.waitForPageLoadComplete(0));
          const u = yield i(e.getWrapperPosition(r));
          if (5 === a.length) {
            if (a.reduce(((e, t) => e + t), 0) / a.length === u) {
              if (r === s) return l.Log.error("Cannot scroll page with found element"), yield i(void 0);
              l.Log.info("Found scrolling element is not scrolling, falling back to document scrolling element"),
                r = s, a = [];
              continue;
            }
            a.shift();
          }
          a.push(u);
          const d = yield i(e.isWrapperOneViewportFromBottom(r));
          if ((c++ < 0 || t.elementsAreBeingModified() || d || c % 20 == 0) && (yield i(yield* o(n(this.extract(e)))),
              t.advanceScroll(), c > 0 && (c = 0)), this.elementLimit > 0 && t.getStoredRecordCount() >= this.elementLimit) return yield i(void 0);
          if (d && t.lastBatchIsDuplicate()) {
            if (yield i(e.scrollDownViewport(r, !0)), yield i(e.waitForPageLoadComplete(0)),
                yield i(yield* o(n(this.extract(e)))), t.advanceScroll(), !t.lastBatchIsDuplicate()) continue;
            if (t.elementsAreBeingModified() || (yield i(e.scrollViewportToTop(r)), yield i(e.scrollViewportToBottom(r)),
                yield i(e.waitForPageLoadComplete(0)), yield i(yield* o(n(this.extract(e)))), t.advanceScroll()),
              !t.lastBatchIsDuplicate()) continue;
            return yield i(void 0);
          }
        }
      }));
    }
  }
  t.SelectorElement = u;
},