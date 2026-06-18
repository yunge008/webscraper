/**
 * UI Component: SitemapListView
 * Source module ID: 7086
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

7086: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SitemapListView = void 0;
  const o = r(44015),
    i = n(r(96540)),
    a = r(96540),
    s = r(82226),
    l = r(56024),
    c = r(8763),
    u = r(49876),
    d = (0,
      o.observer)((() => i.default.createElement(i.default.Fragment, null, i.default.createElement("th", null, "ID"), i.default.createElement("th", null, "Domain"), i.default.createElement("th", {
      className: "sitemap-actions-header"
    }))));
  t.SitemapListView = (0, o.observer)((() => {
    const [e, t] = (0, a.useState)("");
    return s.appState.loading ? i.default.createElement(c.Loader, null) : i.default.createElement("div", {
      id: "sitemaps"
    }, i.default.createElement("input", {
      className: "form-control sitemap-search",
      type: "text",
      value: s.appState.searchQuery,
      placeholder: "Search Sitemaps",
      onChange: e => {
        const t = e.target.value;
        s.appState.updateSearchQuery(t);
      }
    }), i.default.createElement("table", {
      className: "table table-bordered table-condensed table-hover"
    }, i.default.createElement("thead", null, i.default.createElement("tr", null, i.default.createElement(d, null))), i.default.createElement("tbody", null, s.appState.filteredSitemaps.map((e => {
      const r = e.name;
      return i.default.createElement(l.SitemapListItem, {
        key: r,
        sitemap: e,
        deleteSitemap: () => (e => {
          t(e), s.appState.updateDeletionConfirmationModalVisible(!0);
        })(r)
      });
    })))), i.default.createElement(u.DeletionConfirmationModal, {
      performDeletion: () => s.appState.deleteSitemap(e),
      confirmationText: "Are you sure you want to delete the sitemap?"
    }));
  }));
},
