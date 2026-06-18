/**
 * UI Component: SitemapRow
 * Source module ID: 86305
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

86305: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SitemapRow = void 0;
  const o = r(44015),
    i = n(r(96540));
  t.SitemapRow = (0, o.observer)((e => {
    const t = e.sitemap;
    return i.default.createElement("tr", {
      onClick: t => e.editSitemap(t),
      "data-id": t.name
    }, i.default.createElement("td", {
      className: "id"
    }, t.name), i.default.createElement("td", null, t.domain), i.default.createElement("td", null, i.default.createElement("button", {
      type: "button",
      className: "btn btn-danger btn-xs delete-sitemap",
      onClick: e.deleteSitemap
    }, "Delete")));
  }));
},