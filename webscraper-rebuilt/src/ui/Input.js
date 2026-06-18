/**
 * UI Component: Input
 * Source module ID: 41006
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

41006: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Input = void 0;
  const o = n(r(96540)),
    i = r(90330),
    a = r(84417),
    s = r(51619);
  t.Input = ({
    label: e,
    placeholder: t,
    field: r,
    type: n,
    id: l,
    deprecated: c
  }) => {
    const u = (0, i.useFormContext)(),
      d = u.getFieldState(r),
      p = (0, a.getValidationStatusClassName)(d),
      f = c && "" === u.getValues(r);
    return o.default.createElement("div", {
      className: `form-group ${p}${f ? " hidden" : ""}${c ? " deprecated" : ""}`,
      title: "" + (c ? "This feature is deprecated and will not work in a future release." : "")
    }, o.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, e, c ? o.default.createElement("span", {
      className: "question-icon"
    }) : ""), o.default.createElement("div", {
      className: "col-lg-10"
    }, o.default.createElement(s.BaseInput, {
      placeholder: t,
      feature: r,
      type: n,
      id: l
    })));
  };
},