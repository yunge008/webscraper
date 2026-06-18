/**
 * UI Component: SitemapExportView
 * Source module ID: 88776
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

88776: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SitemapExportView = void 0;
  const o = r(44015),
    i = n(r(96540)),
    a = r(82226);
  t.SitemapExportView = (0, o.observer)((() => {
    const {
      sitemap: e
    } = a.appState;
    return i.default.createElement("div", {
      className: "panel"
    }, i.default.createElement("div", {
      className: "panel-body"
    }, i.default.createElement("div", {
      className: "form-group"
    }, i.default.createElement("div", {
      className: "col-lg-12"
    }, i.default.createElement("textarea", {
      rows: 7,
      className: "form-control",
      defaultValue: e.toString()
    })))));
  }));
},