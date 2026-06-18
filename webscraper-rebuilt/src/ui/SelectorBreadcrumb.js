/**
 * UI Component: SelectorBreadcrumb
 * Source module ID: 92234
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

92234: function(e, t, r) {
  "use strict";
  var n = this && this.__awaiter || function(e, t, r, n) {
      return new(r || (r = Promise))((function(o, i) {
        function a(e) {
          try {
            l(n.next(e));
          } catch (e) {
            i(e);
          }
        }

        function s(e) {
          try {
            l(n.throw(e));
          } catch (e) {
            i(e);
          }
        }

        function l(e) {
          var t;
          e.done ? o(e.value) : (t = e.value, t instanceof r ? t : new r((function(e) {
            e(t);
          }))).then(a, s);
        }
        l((n = n.apply(e, t || [])).next());
      }));
    },
    o = this && this.__importDefault || function(e) {
      return e && e.__esModule ? e : {
        default: e
      };
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorBreadcrumb = void 0;
  const i = o(r(96540)),
    a = r(96540),
    s = r(15011),
    l = r(57205),
    c = r(44015),
    u = r(1757),
    d = r(67356),
    p = r(44852),
    f = r(51591),
    h = r(72328),
    m = r(97152),
    g = r(82226);
  t.SelectorBreadcrumb = (0, c.observer)((() => {
    const e = (0, l.useSelectorBreadcrumb)(),
      t = (0, u.useParams)(),
      r = g.appState.sitemap,
      o = g.appState.sitemapSyncEnabled,
      [c, v] = i.default.useState(d.SyncState.synced),
      y = g.appState.experimentalFeaturesEnabled,
      b = o && (null == r ? void 0 : r.selectors.length) && c !== d.SyncState.synced && c !== d.SyncState.cloud,
      w = (0,
        a.useCallback)((() => n(void 0, void 0, void 0, (function*() {
        yield g.appState.allSelectorDataPreview(e);
      }))), [e]),
      S = (0, a.useCallback)((() => n(void 0, void 0, void 0, (function*() {
        yield g.appState.reportDataPreview(e);
      }))), [e]),
      x = (0, a.useCallback)((() => n(void 0, void 0, void 0, (function*() {
        try {
          const e = new h.SitemapRepository,
            r = yield e.get(t.sitemapId), n = yield p.CloudApiClient.fetchSitemap(t.sitemapId), o = m.SitemapTransformer.toSitemapMetadataArray([r]), i = m.SitemapTransformer.toSitemapMetadataArray([n]);
          i[0].localStorage = !1;
          const a = Array.prototype.concat(o, i),
            s = f.SitemapSync.matchSitemaps(a);
          v(s[0].syncState);
        } catch (e) {
          v(d.SyncState.local);
        }
      }))), [t.sitemapId, v]);
    return (0, a.useEffect)((() => {
      o && x();
    }), [x, o]), i.default.createElement("div", {
      className: "top-bar"
    }, i.default.createElement("ol", {
      className: "breadcrumb"
    }, e.map(((e, t) => i.default.createElement(s.SelectorBreadcrumbItem, {
      index: t,
      key: t
    })))), !!b && i.default.createElement("button", {
      type: "button",
      className: "btn btn-success btn-xs upload-sitemap-to-cloud",
      title: "This sitemap version is only in your extension storage. Upload the sitemap to your Cloud account",
      onClick: () => n(void 0, void 0, void 0, (function*() {
        yield g.appState.uploadSitemap(t.sitemapId), yield g.appState.loadSitemaps();
      }))
    }, "Upload sitemap to Cloud"), y && i.default.createElement("button", {
      type: "button",
      className: "btn btn-secondary btn-xs report-training-data",
      onClick: S
    }, "Send training data"), i.default.createElement("button", {
      type: "button",
      className: "btn btn-primary btn-xs all-selector-data-preview",
      onClick: w
    }, "Data preview"));
  }));
},