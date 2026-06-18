/**
 * UI Component: SitemapBrowseView
 * Source module ID: 50280
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

50280: function(e, t, r) {
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
  }), t.SitemapBrowseView = void 0;
  const i = r(44015),
    a = o(r(96540)),
    s = r(96540),
    l = r(24567),
    c = r(78079),
    u = r(82226),
    d = r(75736),
    p = r(66512);
  t.SitemapBrowseView = (0, i.observer)((() => {
    const [e, t] = (0, s.useState)(!0), [r, o] = (0, s.useState)([]), i = u.appState.sitemap.getDataColumns(), h = [...i];
    h[0] = "web_scraper_order", h[1] = "web_scraper_start_url";
    const m = u.appState.sitemap._id,
      g = (0, s.useCallback)((e => l.Obj.stringify(c.TypeTransformer.nullToUndefined(e))), []),
      v = (0,
        s.useCallback)((() => n(void 0, void 0, void 0, (function*() {
        t(!0);
        const e = new d.SitemapDataRepository(m),
          r = new p.SelectorDataParser(u.appState.sitemap);
        let n = yield e.getAll();
        n = r.parseData(n), o(n), t(!1);
      }))), [m]);
    return (0, s.useEffect)((() => {
      v();
    }), [v]), e ? a.default.createElement("div", {
      className: "panel-body"
    }, "Loading") : 0 === r.length ? a.default.createElement("div", {
      id: "sitemap-data"
    }, a.default.createElement("div", {
      className: "panel-body"
    }, a.default.createElement("span", {
      className: "no-data-scraped-yet"
    }, "No data scraped yet.\xa0"), a.default.createElement("button", {
      type: "button",
      className: "btn btn-primary btn-xs",
      id: "refreshData",
      onClick: v
    }, "refresh")), a.default.createElement(f, null)) : a.default.createElement("div", {
      id: "sitemap-data"
    }, a.default.createElement("div", {
      className: "panel-body"
    }, a.default.createElement("button", {
      type: "button",
      className: "btn btn-primary btn-xs",
      id: "refreshData",
      onClick: v
    }, "Refresh Data"), a.default.createElement("span", {
      style: {
        paddingLeft: "30px",
        paddingRight: "10px"
      }
    }, "Help us improve Web Scraper!"), a.default.createElement("a", {
      className: "btn btn-warning btn-xs",
      href: "https://feedback.webscraper.io/",
      target: "_blank"
    }, "Upvote & Submit Feature Ideas")), a.default.createElement("table", {
      className: "table table-bordered table-condensed table-hover"
    }, a.default.createElement("thead", null, a.default.createElement("tr", null, h.map((e => a.default.createElement("th", {
      key: e
    }, e))))), a.default.createElement("tbody", null, r.map(((e, t) => a.default.createElement("tr", {
      key: t
    }, i.map((t => a.default.createElement("td", {
      key: t
    }, g(e[t]))))))))), a.default.createElement(f, null));
  }));
  const f = () => a.default.createElement(a.default.Fragment, null);
},
