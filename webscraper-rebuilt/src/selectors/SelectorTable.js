/**
 * Module: SelectorTable
 * Source module ID: 3358
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

3358: function(e, t, r) {
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
    },
    s = this && this.__importDefault || function(e) {
      return e && e.__esModule ? e : {
        default: e
      };
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorTable = void 0;
  const a = s(r(74692)),
    l = r(31507),
    c = r(90711),
    u = r(24567);
  class d extends c.Selector {
    constructor(e) {
      super(), this.type = "SelectorTable", this.multiple = !0, this.selector = "", this.tableDataRowSelector = "",
        this.tableHeaderRowSelector = "", this.columns = [], this.updateData(e);
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
    getTableHeaderColumns(e) {
      return n(this, void 0, void 0, (function*() {
        const t = this.getTableHeaderRowSelector(),
          r = yield e.getElements(t);
        if (r.length < 1) return {};
        {
          const e = r[0],
            t = yield e.getElements("td,th"), n = [];
          for (const e of t) {
            const t = yield e.getText();
            n.push(t.replace("\n", " "));
          }
          let i = 1;
          const o = {};
          for (const e of n) o[e] = {
            index: i
          }, i++;
          return o;
        }
      }));
    }
    extractTableData(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield this.getTableHeaderColumns(e), r = this.getTableDataRowSelector(), n = yield e.getElements(r), i = [];
        for (const e of n) {
          const r = yield this.extractRowData(e, t);
          i.push(r);
        }
        return i;
      }));
    }
    extractRowData(e, t) {
      return n(this, void 0, void 0, (function*() {
        const r = {};
        for (const n of this.columns)
          if (!0 === n.extract)
            if (void 0 === t[n.header]) r[n.name] = void 0;
            else {
              const i = `td:nth-child(${t[n.header].index}),th:nth-child(${t[n.header].index})`,
                o = yield e.getElements(i);
              if (0 === o.length) r[n.name] = void 0;
              else {
                const e = yield o[0].getText();
                r[n.name] = e;
              }
            }
        return r;
      }));
    }
    _getData(e) {
      return o(this, arguments, (function*() {
        const t = yield i(this.getDataElements(e));
        let r = 0;
        for (const e of t) {
          const t = yield i(this.extractTableData(e));
          for (const e of t) {
            if (yield yield i(e), !1 === this.multiple) return yield i(void 0);
            r++;
          }
        }
        0 === r && !1 === this.multiple && (yield yield i(this.getEmptyRecord()));
      }));
    }
    getDataColumns() {
      const e = [];
      for (const t of this.columns) !0 === t.extract && e.push(t.name);
      return e;
    }
    getFeatures() {
      return ["selector", "tableHeaderRowSelector", "tableDataRowSelector", "multiple", "columns"];
    }
    getTableHeaderRowSelectorFromTableHTML(e) {
      const t = (0, a.default)(e),
        r = ["> thead > tr:has(td:not(:empty))", "> thead > tr:has(th:not(:empty))", "> tbody > tr:has(td:not(:empty))", "> tbody > tr:has(th:not(:empty))"].join(", "),
        n = t.find(r);
      if (n.length) {
        return new l.CssSelector({
          parent: t[0],
          query: e => (0, a.default)(t[0]).find(e)
        }).getCssSelector([n[0]]);
      }
    }
    getTableDataRowSelectorFromTableHTML(e) {
      const t = (0, a.default)(e);
      let r;
      if (t.find("> thead > tr:has(td:not(:empty)), > thead > tr:has(th:not(:empty))").length) r = t.find("> tbody > tr");
      else if (t.find("> tbody > tr > td:not(:empty), > tbody > tr > th:not(:empty)").length) {
        const e = t.find("> tbody > tr"),
          n = `> tbody > tr:nth-of-type(n+${e.index(e.filter(":has(td:not(:empty)),:has(th:not(:empty))")[0]) + 2})`;
        r = t.find(n);
      }
      if (r && r.length) {
        let e = new l.CssSelector({
          parent: t[0],
          query: e => (0, a.default)(t[0]).find(e)
        }).getCssSelector(r.get());
        return 1 === r.length && e.match(/nth\-of\-type\((\d+)\)/) && (e = e.replace(/nth\-of\-type\((\d+)\)/, "nth-of-type(n+$1)")),
          e;
      }
      return "";
    }
    getTableHeaderRowSelector() {
      return void 0 === this.tableHeaderRowSelector ? "thead tr" : this.tableHeaderRowSelector;
    }
    getTableDataRowSelector() {
      return void 0 === this.tableDataRowSelector ? "tbody tr" : this.tableDataRowSelector;
    }
    getTableHeaderColumnsFromHTML(e, t) {
      const r = (0, a.default)(t).find(e).find("td,th"),
        n = [];
      return r.each(((e, t) => {
        (0, a.default)(t).find("br").length && (0, a.default)(t).find("br").html(" ");
        const r = (0, a.default)(t).text().trim(),
          i = r;
        0 !== r.length && n.push({
          header: r,
          name: i,
          extract: !0
        });
      })), n;
    }
    getTableValidationData() {
      const e = this.columns,
        t = {
          tableHeaderRowSelector: this.tableHeaderRowSelector,
          tableDataRowSelector: this.tableDataRowSelector
        },
        r = {};
      for (let t = 0; t < e.length; t++) r[`columns[${t}][name]`] = e[t].name;
      return Object.assign(Object.assign({}, t), r);
    }
    getValidationData() {
      const e = u.Obj.clone(this);
      return delete e.columns, Object.assign(Object.assign({}, e), this.getTableValidationData());
    }
    getSelectorsForOptimization() {
      return ["selector", "tableHeaderRowSelector", "tableDataRowSelector"];
    }
  }
  t.SelectorTable = d;
},