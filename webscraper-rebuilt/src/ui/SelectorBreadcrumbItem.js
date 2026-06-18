/**
 * UI Component: SelectorBreadcrumbItem
 * Source module ID: 15011
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

15011: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorBreadcrumbItem = void 0;
  const o = n(r(96540)),
    i = r(1757),
    a = r(57205),
    s = r(789);
  t.SelectorBreadcrumbItem = ({
    index: e
  }) => {
    const t = (0, i.useNavigate)(),
      r = (0, i.useParams)(),
      n = (0, a.useSelectorBreadcrumb)(),
      l = n[e];
    return o.default.createElement("li", {
      onClick: () => {
        const o = `/sitemap/${r.sitemapId}/selectors`,
          i = n.slice(0, e + 1);
        t(`${o}/${s.Str.serialize(i)}`);
      }
    }, o.default.createElement("a", null, l));
  };
},