/**
 * UI Component: Columns
 * Source module ID: 71322
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

71322: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Columns = void 0;
  const o = n(r(96540)),
    i = r(90330),
    a = r(14313),
    s = r(84417);
  t.Columns = ({
    feature: e
  }) => {
    const t = (0, i.useFormContext)(),
      r = t.watch("columns");
    return o.default.createElement("div", {
      className: "form-group"
    }, o.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, "Table columns"), o.default.createElement("div", {
      className: "col-lg-10"
    }, o.default.createElement("table", {
      className: "table table-bordered table-condensed"
    }, o.default.createElement("thead", null, o.default.createElement("tr", null, o.default.createElement("th", {
      className: "column-header-cell"
    }, "Column"), o.default.createElement("th", {
      className: "column-name-cell"
    }, "Result key"), o.default.createElement("th", {
      className: "column-extract-cell"
    }, "Include into result"))), o.default.createElement("tbody", null, r.map(((e, r) => {
      var n, i, l;
      const c = (0, s.getValidationStatusClassName)(t.getFieldState(`columns.${r}.name`));
      return o.default.createElement("tr", {
        key: `id${r}`
      }, o.default.createElement("td", {
        className: "column-header-cell"
      }, o.default.createElement("input", Object.assign({
        className: "column-header",
        type: "hidden"
      }, t.register(`columns.${r}.header`))), " ", e.header), o.default.createElement("td", {
        className: "column-name-cell"
      }, o.default.createElement("div", {
        className: `form-group ${c}`
      }, o.default.createElement("div", null, o.default.createElement("input", Object.assign({
        className: "column-name form-control",
        type: "text"
      }, t.register(`columns.${r}.name`)))), o.default.createElement(a.ValidationError, {
        field: `columns.${r}`,
        message: null === (l = null === (i = null === (n = t.formState.errors.columns) || void 0 === n ? void 0 : n[r]) || void 0 === i ? void 0 : i.name) || void 0 === l ? void 0 : l.message
      }))), o.default.createElement("td", {
        className: "column-extract-cell"
      }, o.default.createElement("input", Object.assign({
        className: "column-extract",
        type: "checkbox"
      }, t.register(`columns.${r}.extract`)))));
    }))))));
  };
},