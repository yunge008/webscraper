/**
 * UI Component: MultipleTypeDropdown
 * Source module ID: 48500
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

48500: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.MultipleTypeDropdown = void 0;
  const o = n(r(96540)),
    i = r(90330),
    a = r(50869),
    s = [{
      type: "singleColumn",
      label: "First Record Only"
    }, {
      type: "multipleColumns",
      label: "Multiple Records in Multiple Columns"
    }, {
      type: "singleColumnWithSeparator",
      label: "Multiple Records in One Column"
    }];
  t.MultipleTypeDropdown = () => {
    const e = (0, i.useFormContext)(),
      t = e.watch("multipleType");
    return o.default.createElement(o.default.Fragment, null, o.default.createElement("div", {
      className: "form-group"
    }, o.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, "Multiple Type"), o.default.createElement("div", {
      className: "col-lg-10"
    }, o.default.createElement("select", Object.assign({
      className: "form-control"
    }, e.register("multipleType", {
      onChange: t => {
        "multipleColumns" !== t.target.value && e.resetField("columnCount");
      }
    })), s.map((e => o.default.createElement("option", {
      key: e.type,
      value: e.type
    }, e.label)))))), "multipleColumns" === t && o.default.createElement(a.ItemLimit, {
      feature: "columnCount",
      placeholder: "Column Count"
    }));
  };
},