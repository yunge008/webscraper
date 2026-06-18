/**
 * UI Component: ValidationError
 * Source module ID: 14313
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

14313: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ValidationError = void 0;
  const o = n(r(96540)),
    i = r(11976);
  t.ValidationError = e => e.message ? o.default.createElement(i.Typography, {
    component: "small",
    "data-error": e.field,
    className: "help-block validation-error-message",
    sx: {
      display: "block",
      color: "error.main"
    },
    title: e.message
  }, e.message) : o.default.createElement(o.default.Fragment, null);
},