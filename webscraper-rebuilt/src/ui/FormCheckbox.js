/**
 * UI Component: FormCheckbox
 * Source module ID: 15866
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

15866: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.FormCheckbox = void 0;
  const o = n(r(96540)),
    i = r(13667),
    a = {
      multiple: "Multiple",
      scroll: "Scroll"
    };
  t.FormCheckbox = ({
    feature: e
  }) => {
    const t = a[e];
    return o.default.createElement(i.Checkbox, {
      feature: e,
      label: t
    });
  };
},