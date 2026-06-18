/**
 * UI Component: ScriptDataColumns
 * Source module ID: 28185
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

28185: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ScriptDataColumns = void 0;
  const o = n(r(96540)),
    i = r(90330);
  t.ScriptDataColumns = () => {
    const {
      register: e,
      control: t
    } = (0, i.useFormContext)(), {
      append: r,
      remove: n,
      replace: a,
      fields: s
    } = (0,
      i.useFieldArray)({
      name: "scriptDataColumns",
      control: t
    }), l = {
      width: "5%",
      whiteSpace: "nowrap",
      textAlign: "center"
    };
    return o.default.createElement("div", {
      className: "form-group"
    }, o.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, "Returned data columns"), o.default.createElement("div", {
      className: "col-lg-10"
    }, o.default.createElement("table", {
      className: "table table-bordered"
    }, o.default.createElement("thead", null, o.default.createElement("tr", null, o.default.createElement("th", null, "Column Name"), o.default.createElement("th", {
      style: l
    }, "Is URL (only one)"), o.default.createElement("th", {
      style: l
    }))), o.default.createElement("tbody", null, s.map(((t, r) => o.default.createElement("tr", {
      key: r
    }, o.default.createElement("td", null, o.default.createElement("input", Object.assign({
      type: "text",
      className: "form-control",
      placeholder: "Column Name"
    }, e(`scriptDataColumns.${r}.name`)))), o.default.createElement("td", {
      style: l
    }, o.default.createElement("input", Object.assign({
      className: "is-url",
      type: "checkbox",
      value: "1"
    }, e(`scriptDataColumns.${r}.is_url`)))), o.default.createElement("td", null, o.default.createElement("button", {
      className: "btn btn-danger",
      type: "button",
      onClick: () => n(r)
    }, "Remove"))))))), o.default.createElement("button", {
      type: "button",
      className: "btn btn-primary add-column",
      onClick: () => {
        r({
          name: "",
          is_url: !1
        });
      }
    }, "Add Column")));
  };
},