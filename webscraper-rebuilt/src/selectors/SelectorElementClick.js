/**
 * Module: SelectorElementClick
 * Source module ID: 14120
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

14120: function(e, t, r) {
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
  }), t.SelectorElementClick = void 0;
  const s = r(90711),
    a = r(94341),
    l = r(70259),
    c = r(94606);
  class u extends s.Selector {
    constructor(e, t = !1) {
      super(), this.type = "SelectorElementClick", this.clickActionType = c.ClickActionTypes.auto,
        this.clickElementSelector = "", this.clickElementUniquenessType = "uniqueText",
        this.clickType = "clickOnce", this.delay = 2 * l.TIME.ONE_SECOND_MS, this.discardInitialElements = "discard-when-click-element-exists",
        this.multiple = !0, this.selector = "", t && !e.clickActionType && (e.clickActionType = "real"),
        !0 === e.discardInitialElements || "discard" === e.discardInitialElements ? e.discardInitialElements = "discard" : !1 === e.discardInitialElements || "do-not-discard" === e.discardInitialElements ? e.discardInitialElements = "do-not-discard" : "discard-when-click-element-exists" === e.discardInitialElements ? e.discardInitialElements = "discard-when-click-element-exists" : e.discardInitialElements = "do-not-discard",
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
    getClickActionType() {
      return void 0 === this.clickActionType ? c.ClickActionTypes.auto : this.clickActionType;
    }
    getClickElements(e) {
      return n(this, void 0, void 0, (function*() {
        return yield e.getElements(this.clickElementSelector);
      }));
    }
    getClickElementUniquenessType() {
      return void 0 === this.clickElementUniquenessType ? "uniqueText" : this.clickElementUniquenessType;
    }
    addInitialElements(e, t) {
      return n(this, void 0, void 0, (function*() {
        if ("discard" === this.discardInitialElements) return;
        if ("discard-when-click-element-exists" === this.discardInitialElements) {
          if ((yield this.getClickElements(e)).length > 0) return;
        }
        const r = yield this.getDataElements(e);
        for (const e of r) yield t.push(e);
      }));
    }
    _getData(e) {
      return o(this, arguments, (function*() {
        yield i(this.waitDelay());
        const t = parseInt(`${this.delay}`, 10) || 0,
          r = new a.UniqueElementList("uniqueHTMLText"),
          n = new a.UniqueElementList(this.getClickElementUniquenessType()),
          o = this.getClickActionType();
        yield i(this.addInitialElements(e, r));
        for (const e of r.getElements()) yield yield i(e);
        for (;;) {
          const s = yield i(this.getClickButton(e, n));
          if (!1 === s) break;
          "clickOnce" === this.clickType && (yield i(n.push(s))), yield i(s.click(o)), yield i(e.waitForPageLoadComplete(t, !0));
          const a = yield i(this.getDataElements(e)), l = r.length;
          for (const e of a) {
            (yield i(r.push(e))) && (yield yield i(e));
          }
          const c = r.length - l;
          ("clickOnce" === this.clickType || "clickMore" === this.clickType && 0 === c) && (yield i(n.push(s)));
        }
      }));
    }
    getDataColumns() {
      return [];
    }
    getFeatures() {
      return ["selector", "clickElementSelector", "clickType", "clickElementUniquenessType", "multiple", "discardInitialElements", "delay", "clickActionType"];
    }
    getExperimentalFeatures() {
      return ["clickActionType"];
    }
    getSelectorsForOptimization() {
      return ["selector", "clickElementSelector"];
    }
    getClickButton(e, t) {
      return n(this, void 0, void 0, (function*() {
        const r = yield this.getClickElements(e);
        for (const e of r) {
          if (!(yield t.isElementAdded(e))) return e;
        }
        return !1;
      }));
    }
  }
  t.SelectorElementClick = u;
},