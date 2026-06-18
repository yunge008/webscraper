/**
 * Module: SelectorHTML
 * Source module ID: 1817
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

1817: function(e, t, r) {
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
  }), t.SelectorHTML = void 0;
  const o = r(90711);
  class s extends o.Selector {
    constructor(e) {
      super(), this.type = "SelectorHTML", this.selector = "", this.multiple = !1, this.regex = "",
        this.updateData(e);
    }
    canReturnMultipleRecords() {
      return !0;
    }
    canHaveChildSelectors() {
      return !1;
    }
    canCreateNewJobs() {
      return !1;
    }
    willReturnElements() {
      return !1;
    }
    _getData(e) {
      return i(this, arguments, (function*() {
        const t = yield n(this.getDataElements(e));
        !1 === this.multiple && 0 === t.length && (yield yield n(this.getEmptyRecord()));
        for (const e of t) {
          let t = yield n(e.getHTML());
          const r = {};
          if (void 0 !== this.regex && this.regex && this.regex.length) {
            const e = t.match(new RegExp(this.regex));
            t = null !== e ? e[0] : void 0;
          }
          r[this.id] = t, yield yield n(r);
        }
      }));
    }
    getDataColumns() {
      return [this.id];
    }
    getFeatures() {
      return ["selector", "multiple", "regex"];
    }
    getSelectorsForOptimization() {
      return ["selector"];
    }
  }
  t.SelectorHTML = s;
},