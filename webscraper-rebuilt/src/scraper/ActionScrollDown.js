/**
 * Module: ActionScrollDown
 * Source module ID: 18382
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

18382: function(e, t, r) {
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
  }), t.ActionScrollDown = void 0;
  const s = r(90711),
    a = r(70259);
  class l extends s.Selector {
    constructor(e) {
      super(), this.type = "ActionScrollDown", this.delay = 2 * a.TIME.ONE_SECOND_MS,
        this.selectorScrollElement = "", this.selectorScrollDownIfElementNotVisible = "",
        this.selectorScrollToElement = "", this.updateData(e);
    }
    get selector() {
      return "_parent_";
    }
    canReturnMultipleRecords() {
      return !1;
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
    getDataColumns() {
      return [];
    }
    isNeededElementVisible(e) {
      return n(this, void 0, void 0, (function*() {
        if (!this.selectorScrollDownIfElementNotVisible) return !1;
        return !!(yield e.getElements(this.selectorScrollDownIfElementNotVisible)).length;
      }));
    }
    scrollDown(e) {
      return n(this, void 0, void 0, (function*() {
        if (yield this.isNeededElementVisible(e)) return;
        const t = !this.selectorScrollToElement;
        if (this.selectorScrollElement) {
          const r = yield e.getElement(this.selectorScrollElement);
          yield e.scrollDownElement(e.element, this.selectorScrollToElement, t, r.element);
        } else yield e.scrollDownBody(e.element, this.selectorScrollToElement, t);
        yield e.waitForPageLoadComplete(this.delay);
      }));
    }
    _getData(e) {
      return o(this, arguments, (function*() {
        yield i(this.scrollDown(e)), yield yield i(e);
      }));
    }
    getFeatures() {
      return ["selectorScrollElement", "selectorScrollDownIfElementNotVisible", "selectorScrollToElement", "delay", "performActionButton"];
    }
    getSelectorsForOptimization() {
      return ["selectorScrollElement", "selectorScrollDownIfElementNotVisible", "selectorScrollToElement"];
    }
  }
  t.ActionScrollDown = l;
},