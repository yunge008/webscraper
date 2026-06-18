/**
 * Module: SelectorScriptData
 * Source module ID: 69979
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

69979: function(e, t, r) {
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
  }), t.SelectorScriptData = void 0;
  const o = r(90711),
    s = r(8012);
  class a extends o.Selector {
    constructor(e) {
      super(), this.type = "SelectorScriptData", this.script = "", this.scriptDataColumns = [{
        name: "",
        is_url: !1
      }], this.multiple = !1, this.updateData(e);
    }
    canReturnMultipleRecords() {
      return !0;
    }
    canHaveChildSelectors() {
      return this.canCreateNewJobs();
    }
    canCreateNewJobs() {
      for (const e of this.scriptDataColumns)
        if (e.is_url) return !0;
      return !1;
    }
    willReturnElements() {
      return !1;
    }
    parseData(e) {
      const t = this.getUrlColumn(),
        r = this.getDataColumns();
      return e.map((e => {
        const n = {};
        for (const t of r) n[t] = e[t] || s.emptyRecordValue;
        return t && void 0 !== e[t] && null !== e[t] && (n._follow = e[t], n._followSelectorId = this.id),
          n;
      }));
    }
    _getData(e) {
      return i(this, arguments, (function*() {
        let t = yield n(e.getDataWithScript(this.script));
        t = this.parseData(t), !1 === this.multiple && 0 === t.length && (yield yield n(this.getEmptyRecord()));
        for (const e of t)
          if (yield yield n(e), !1 === this.multiple) return yield n(void 0);
      }));
    }
    getDataColumns() {
      return this.scriptDataColumns.map((e => e.name));
    }
    getFeatures() {
      return ["script", "scriptDataColumns", "multiple", "dataColumns"];
    }
    getSelectorsForOptimization() {
      return [];
    }
    getUrlColumn() {
      for (const e of this.scriptDataColumns)
        if (e.is_url) return e.name;
    }
  }
  t.SelectorScriptData = a;
},