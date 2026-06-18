/**
 * Module: SelectorText
 * Source module ID: 90319
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

90319: function(e, t, r) {
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
  }), t.SelectorText = void 0;
  const o = r(90711);
  class s extends o.Selector {
    constructor(e, t = !1) {
      super(), this.type = "SelectorText", this.selector = "", this.multiple = !1, this.regex = "",
        e.multipleType = e.multipleType || "singleColumn", e.columnCount = "multipleColumns" === e.multipleType ? e.columnCount || 5 : void 0,
        void 0 !== e.columnCount && (e.columnCount = e.columnCount > 0 ? e.columnCount : 1),
        "singleColumn" !== e.multipleType && delete e.multiple, t && (e.version = 2), this.updateData(e);
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
        const t = yield n(e.getElements(this.selector));
        !1 === this.multiple && 0 === t.length && (yield yield n(this.getEmptyRecord()));
        const r = [];
        for (const e of t) {
          let t = yield n(e.getText());
          if (void 0 !== this.regex && this.regex && this.regex.length) {
            const e = t.match(new RegExp(this.regex));
            t = null !== e ? e[0] : void 0;
          }
          r.push(t);
        }
        switch (this.multipleType) {
          case "singleColumn":
            for (const e of r)
              if (yield yield n({
                  [this.getColumnId()]: e
                }), !this.multiple) return yield n(void 0);
            return yield n(void 0);

          case "singleColumnWithSeparator":
            return yield yield n({
              [this.getColumnId()]: r
            }), yield n(void 0);

          case "multipleColumns":
            const e = {};
            for (let t = 0; t < r.length && t < this.columnCount; t++) e[this.getColumnId(t)] = r[t];
            return yield yield n(e), yield n(void 0);

          default:
            throw new Error(`Unsupported multipleType: ${this.multipleType}`);
        }
      }));
    }
    getDataColumns() {
      if ("multipleColumns" !== this.multipleType) return [this.getColumnId()];
      {
        const e = [];
        for (let t = 0; t < this.columnCount; t++) e.push(this.getColumnId(t));
        return e;
      }
    }
    getFormatters() {
      return "singleColumnWithSeparator" === this.multipleType ? {
        [this.getColumnId()]: [{
          type: "StringEscapeFormatter",
          args: {
            searchValue: /^\s+$/gm,
            replaceValue: ""
          }
        }, {
          type: "StringEscapeFormatter",
          args: {
            searchValue: /\n{2,}/g,
            replaceValue: "\n"
          }
        }, {
          type: "ArrayJoinFormatter",
          args: {
            separator: "\n\n"
          }
        }]
      } : super.getFormatters();
    }
    getFeatures() {
      return ["selector", "multipleType", "regex"];
    }
    getHiddenFeatures() {
      return ["columnCount", "multiple", "version"];
    }
    getSelectorsForOptimization() {
      return ["selector"];
    }
    getColumnId(e) {
      return this.version && 1 !== this.version ? `${this.id}${void 0 !== e ? `_${e + 1}` : ""}` : `${this.id}${void 0 !== e ? `-${e + 1}` : ""}`;
    }
  }
  t.SelectorText = s;
},
