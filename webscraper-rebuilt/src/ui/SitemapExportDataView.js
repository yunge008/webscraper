/**
 * UI Component: SitemapExportDataView
 * Source module ID: 90384
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

90384: function(e, t, r) {
  "use strict";
  var n, o = this && this.__createBinding || (Object.create ? function(e, t, r, n) {
      void 0 === n && (n = r);
      var o = Object.getOwnPropertyDescriptor(t, r);
      o && !("get" in o ? !t.__esModule : o.writable || o.configurable) || (o = {
        enumerable: !0,
        get: function() {
          return t[r];
        }
      }), Object.defineProperty(e, n, o);
    } : function(e, t, r, n) {
      void 0 === n && (n = r), e[n] = t[r];
    }),
    i = this && this.__setModuleDefault || (Object.create ? function(e, t) {
      Object.defineProperty(e, "default", {
        enumerable: !0,
        value: t
      });
    } : function(e, t) {
      e.default = t;
    }),
    a = this && this.__importStar || (n = function(e) {
      return n = Object.getOwnPropertyNames || function(e) {
        var t = [];
        for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && (t[t.length] = r);
        return t;
      }, n(e);
    }, function(e) {
      if (e && e.__esModule) return e;
      var t = {};
      if (null != e)
        for (var r = n(e), a = 0; a < r.length; a++) "default" !== r[a] && o(t, e, r[a]);
      return i(t, e), t;
    });
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SitemapExportDataView = void 0;
  const s = r(44015),
    l = a(r(96540)),
    c = r(8763),
    u = r(82226);
  t.SitemapExportDataView = (0, s.observer)((() => {
    (0, l.useEffect)((() => {
      u.appState.stopLoader();
    }));
    const e = e => () => {
      const t = u.appState.sitemap;
      return u.appState.downloadSitemapExport(t, e, !0);
    };
    return u.appState.loading ? l.default.createElement(c.Loader, {
      message: "Generating file"
    }) : l.default.createElement("div", {
      className: "download-button-block"
    }, l.default.createElement("div", {
      className: "download-as"
    }, "Download as:"), l.default.createElement("div", null, l.default.createElement("button", {
      type: "button",
      className: "download-button btn btn-primary btn-xs xlsx-file",
      onClick: e("xlsx")
    }, ".XLSX"), l.default.createElement("button", {
      type: "button",
      className: "download-button btn btn-primary btn-xs csv-file",
      onClick: e("csv")
    }, ".CSV")));
  }));
},