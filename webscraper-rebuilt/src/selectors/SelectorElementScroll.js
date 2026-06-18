/**
 * Module: SelectorElementScroll
 * Source module ID: 81351
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

81351: function(e, t, r) {
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
    },
    i = this && this.__await || function(e) {
      return this instanceof i ? (this.v = e, this) : new i(e);
    },
    o = this && this.__asyncGenerator || function(e, t, r) {
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
  }), t.SelectorElementScroll = void 0;
  const s = r(90711),
    a = r(70259);
  class l extends s.Selector {
    constructor(e, t = !1) {
      super(), this.type = "SelectorElementScroll", this.selector = "", this.multiple = !0,
        this.delay = 2 * a.TIME.ONE_SECOND_MS, this.scrollElementSelector = "", this.elementLimit = 500,
        "string" == typeof e.elementLimit && "" === e.elementLimit && (e.elementLimit = 0),
        this.updateData(e, t);
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
    scrollToBottom(e) {
      return n(this, arguments, void 0, (function*(e, t = !1) {
        const r = e.element;
        if (this.scrollElementSelector) {
          const n = yield e.getElement(this.scrollElementSelector);
          if (!n) return;
          yield e.scrollDownElement(r, this.selector, t, n.element);
        } else yield e.scrollDownBody(r, this.selector, t);
      }));
    }
    scrollToTop(e) {
      return n(this, void 0, void 0, (function*() {
        if (this.scrollElementSelector) {
          const t = yield e.getElement(this.scrollElementSelector);
          if (!t) return;
          yield e.scrollElementToTop(t.element);
        } else yield e.srcollBodyToTop();
      }));
    }
    _getData(e) {
      return o(this, arguments, (function*() {
        yield i(this.waitDelay()), yield i(this.scrollToTop(e));
        const t = parseInt(`${this.delay}`, 10) || 0;
        let r = 0;
        for (;;) {
          yield i(this.scrollToBottom(e)), yield i(e.waitForPageLoadComplete(t));
          let n = yield i(this.getDataElements(e));
          if (n.length === r && (yield i(this.scrollToTop(e)), yield i(this.scrollToBottom(e, !0)),
              yield i(e.waitForPageLoadComplete(t)), n = yield i(this.getDataElements(e)), n.length === r)) return yield i(void 0);
          for (let e = r; e < n.length; e++)
            if (yield yield i(n[e]), 0 !== this.elementLimit && e + 1 === this.elementLimit) return yield i(void 0);
          r = n.length;
        }
      }));
    }
    getDataColumns() {
      return [];
    }
    getFeatures() {
      return ["selector", "multiple", "elementLimit", "delay", "scrollElementSelector"];
    }
    getExperimentalFeatures() {
      return ["scrollElementSelector"];
    }
    getNewFeatureData() {
      return {
        elementLimit: 0
      };
    }
    getUIValue(e) {
      return "elementLimit" === e && (0 === this.elementLimit || "string" == typeof this.elementLimit && "0" === this.elementLimit) ? "" : this[e];
    }
    getSelectorsForOptimization() {
      return ["selector", "scrollElementSelector"];
    }
  }
  t.SelectorElementScroll = l;
},