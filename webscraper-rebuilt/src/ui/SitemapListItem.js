/**
 * UI Component: SitemapListItem
 * Source module ID: 56024
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

56024: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SitemapListItem = void 0;
  const o = r(44015),
    i = n(r(96540)),
    a = r(84845),
    s = r(86305),
    l = r(1757),
    c = r(789),
    u = r(82226);
  t.SitemapListItem = (0, o.observer)((e => {
    const t = (0, l.useNavigate)(),
      {
        sitemap: r
      } = e,
      n = r.name,
      o = e => {
        e.target.classList.contains("btn") || t(`/sitemap/${n}/selectors/${c.Str.serialize([ "_root" ])}`);
      };
    return u.appState.sitemapSyncEnabled ? i.default.createElement(a.SitemapRowWithSyncEnabled, {
      sitemap: r,
      editSitemap: o,
      deleteSitemap: e.deleteSitemap
    }) : i.default.createElement(s.SitemapRow, {
      sitemap: r,
      editSitemap: o,
      deleteSitemap: e.deleteSitemap
    });
  }));
},