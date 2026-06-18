/**
 * UI Component: FormInput
 * Source module ID: 45877
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

45877: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.FormInput = void 0;
  const o = n(r(96540)),
    i = r(41006),
    a = {
      elementLimit: {
        label: "Element limit",
        placeholder: "Unlimited",
        deprecated: !1
      },
      maxPages: {
        label: "Max pages",
        placeholder: "Unlimited",
        deprecated: !1
      },
      regex: {
        label: "Regex",
        placeholder: "",
        deprecated: !0
      },
      sitemapXmlUrlRegex: {
        label: "Found Url Regex",
        placeholder: "",
        deprecated: !1
      },
      sitemapXmlMinimumPriority: {
        label: "Minimum priority",
        placeholder: "",
        deprecated: !1
      },
      delay: {
        label: "Delay (ms)",
        placeholder: "",
        deprecated: !1
      }
    };
  t.FormInput = ({
    feature: e
  }) => {
    const t = a[e];
    return o.default.createElement(i.Input, {
      id: e,
      field: e,
      label: t.label,
      placeholder: t.placeholder,
      deprecated: t.deprecated
    });
  };
},
