/**
 * UI Component: Loader
 * Source module ID: 8763
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

8763: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Loader = void 0;
  const o = n(r(96540));
  t.Loader = ({
    message: e
  }) => o.default.createElement(o.default.Fragment, null, o.default.createElement("div", {
    className: "loader-message"
  }, o.default.createElement("p", null, e)), o.default.createElement("div", {
    className: "lds-ellipsis"
  }, o.default.createElement("div", null), o.default.createElement("div", null), o.default.createElement("div", null), o.default.createElement("div", null)));
},