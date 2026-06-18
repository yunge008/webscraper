/**
 * UI Component: Checkbox
 * Source module ID: 13667
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

13667: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Checkbox = void 0;
  const o = n(r(96540)),
    i = r(90330);
  t.Checkbox = ({
    feature: e,
    label: t
  }) => {
    const r = (0, i.useFormContext)();
    return o.default.createElement("div", {
      className: "form-group"
    }, o.default.createElement("div", {
      className: "col-lg-offset-1 col-lg-10"
    }, o.default.createElement("div", {
      className: "checkbox"
    }, o.default.createElement("label", null, o.default.createElement("input", Object.assign({
      id: e,
      type: "checkbox"
    }, r.register(e))), t))));
  };
},