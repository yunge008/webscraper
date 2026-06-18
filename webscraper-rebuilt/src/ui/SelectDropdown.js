/**
 * UI Component: SelectDropdown
 * Source module ID: 33675
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

33675: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectDropdown = void 0;
  const o = n(r(96540)),
    i = r(90330);
  t.SelectDropdown = ({
    field: e,
    label: t,
    options: r
  }) => {
    const n = (0, i.useFormContext)();
    return o.default.createElement("div", {
      className: "form-group"
    }, o.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, t), o.default.createElement("div", {
      className: "col-lg-10"
    }, o.default.createElement("select", Object.assign({
      className: "form-control"
    }, n.register(e)), Object.entries(r).map((([e, t]) => o.default.createElement("option", {
      key: e,
      value: e
    }, t))))));
  };
},