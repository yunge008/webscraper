/**
 * UI Component: SitemapRowWithSyncEnabled
 * Source module ID: 84845
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

84845: function(e, t, r) {
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
  }), t.SitemapRowWithSyncEnabled = void 0;
  const i = r(44015),
    a = r(35338),
    s = o(r(96540)),
    l = r(82226);
  t.SitemapRowWithSyncEnabled = (0, i.observer)((e => {
    const t = e.sitemap,
      r = a.syncStateProperties[t.syncState],
      o = t.name;
    return s.default.createElement("tr", {
      className: "sitemap-row",
      onClick: t => e.editSitemap(t),
      "data-id": t.name
    }, s.default.createElement("td", {
      className: "sync-state"
    }, r.stateIcon), s.default.createElement("td", {
      className: "id"
    }, t.name), s.default.createElement("td", {
      className: "domain"
    }, t.domain), s.default.createElement("td", {
      className: "upload-to-cloud"
    }, r.uploadBtn ? s.default.createElement("button", {
      type: "button",
      className: `btn ${r.uploadBtn.class} btn-xs`,
      title: r.uploadBtn.title,
      onClick: () => n(void 0, void 0, void 0, (function*() {
        yield l.appState.uploadSitemap(o), yield l.appState.loadSitemaps();
      }))
    }, r.uploadBtn.text) : ""), s.default.createElement("td", {
      className: "download-from-cloud"
    }, r.downloadBtn ? s.default.createElement("button", {
      type: "button",
      className: `btn ${r.downloadBtn.class} btn-xs`,
      title: r.downloadBtn.title,
      onClick: () => n(void 0, void 0, void 0, (function*() {
        yield l.appState.downloadSitemap(o), yield l.appState.loadSitemaps();
      }))
    }, r.downloadBtn.text) : ""), s.default.createElement("td", null, r.deleteBtn ? s.default.createElement("button", {
      type: "button",
      className: "btn btn-danger btn-xs delete-locally",
      onClick: () => e.deleteSitemap()
    }, "Delete locally") : ""));
  }));
},