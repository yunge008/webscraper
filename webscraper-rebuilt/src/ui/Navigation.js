/**
 * UI Component: Navigation
 * Source module ID: 15733
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

15733: function(e, t, r) {
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
    }), t.Navigation = void 0;
    const i = r(44015),
      a = o(r(96540)),
      s = r(1757),
      l = r(49442),
      c = r(789),
      u = r(82226),
      d = (0,
        i.observer)((() => {
        return a.default.createElement(a.default.Fragment, null);
      }));
    t.Navigation = (0, i.observer)((() => {
      const {
        sitemap: e
      } = u.appState, t = e ? e._id : "";
      return a.default.createElement("nav", {
        className: "navbar navbar-default",
        role: "navigation"
      }, a.default.createElement("div", {
        className: "collapse navbar-collapse navbar-ex1-collapse"
      }, a.default.createElement("ul", {
        className: "nav navbar-nav"
      }, a.default.createElement("li", null, a.default.createElement(s.Link, {
        id: "sitemaps-nav-button",
        to: "/",
        replace: !0
      }, "Sitemaps")), a.default.createElement("li", null, a.default.createElement("a", {
        id: "sitemap-nav-button",
        className: "dropdown-toggle" + (e ? "" : " disabled"),
        "data-toggle": "dropdown"
      }, "Sitemap\xa0", a.default.createElement("span", {
        id: "navbar-active-sitemap-id"
      }, t), a.default.createElement("b", {
        className: "caret"
      })), a.default.createElement("ul", {
        className: "dropdown-menu"
      }, a.default.createElement("li", null, a.default.createElement(s.Link, {
        className: "selectors",
        to: `/sitemap/${t}/selectors/${c.Str.serialize([ "_root" ])}`,
        replace: !0
      }, "Selectors")), a.default.createElement("li", null, a.default.createElement(s.Link, {
        className: "edit-metadata",
        to: `/sitemap/${t}/edit-metadata`,
        replace: !0
      }, "Edit metadata")), a.default.createElement("li", null, a.default.createElement(s.Link, {
        className: "website-state-setup",
        to: `/sitemap/${t}/website-state-setup`,
        replace: !0
      }, "Website state setup")), a.default.createElement("li", null, a.default.createElement(s.Link, {
        className: "scrape",
        to: `/sitemap/${t}/scrape`,
        replace: !0
      }, "Scrape")), a.default.createElement("li", null, a.default.createElement(s.Link, {
        className: "browse",
        to: `/sitemap/${t}/browse`,
        replace: !0
      }, "Browse")), a.default.createElement("li", null, a.default.createElement(s.Link, {
        className: "export-sitemap",
        to: `/sitemap/${t}/export`,
        replace: !0
      }, "Export Sitemap")), a.default.createElement("li", null, a.default.createElement(s.Link, {
        className: "export-data",
        to: `/sitemap/${t}/export-data`,
        replace: !0
      }, "Export data")))), a.default.createElement("li", null, a.default.createElement("a", {
        id: "create-sitemap-nav-button",
        className: "dropdown-toggle",
        "data-toggle": "dropdown"
      }, "Create new sitemap ", a.default.createElement("b", {
        className: "caret"
      })), a.default.createElement("ul", {
        className: "dropdown-menu"
      }, a.default.createElement("li", null, a.default.createElement(s.Link, {
        className: "create-sitemap",
        to: "/create-sitemap",
        replace: !0
      }, "Create Sitemap")), a.default.createElement("li", null, a.default.createElement(s.Link, {
        className: "import-sitemap",
        to: "/import-sitemap",
        replace: !0
      }, "Import Sitemap")), a.default.createElement("li", null, a.default.createElement("a", {
        className: "create-sitemap-wizard",
        onClick: e => n(void 0, void 0, void 0, (function*() {
          e.preventDefault();
          const t = chrome.devtools.inspectedWindow.tabId;
          yield chrome.sidePanel.open({
            tabId: t
          });
        }))
      }, "Create Sitemap Wizard (Alpha) ")))), a.default.createElement("li", null, a.default.createElement("a", {
        id: "help-nav-button",
        className: "dropdown-toggle",
        "data-toggle": "dropdown"
      }, "Help ", a.default.createElement("b", {
        className: "caret"
      })), a.default.createElement("ul", {
        className: "dropdown-menu"
      }, a.default.createElement("li", null, a.default.createElement("a", {
        onClick: () => l.devtoolsBackgroundScriptClient.openUrlInNewTab("https://webscraper.io/tutorials?utm_source=extension&utm_medium=help")
      }, "Video Tutorials")), a.default.createElement("li", null, a.default.createElement("a", {
        onClick: () => l.devtoolsBackgroundScriptClient.openUrlInNewTab("https://webscraper.io/documentation?utm_source=extension&utm_medium=help")
      }, "Documentation")), a.default.createElement("li", null, a.default.createElement("a", {
        onClick: () => l.devtoolsBackgroundScriptClient.openUrlInNewTab("https://webscraper.io/test-sites?utm_source=extension&utm_medium=help")
      }, "Test Sites")), a.default.createElement("li", null, a.default.createElement("a", {
        onClick: () => l.devtoolsBackgroundScriptClient.openUrlInNewTab("https://forum.webscraper.io/?utm_source=extension&utm_medium=help")
      }, "Forum")), a.default.createElement("li", null, a.default.createElement("a", {
        onClick: () => l.devtoolsBackgroundScriptClient.openUrlInNewTab("https://feedback.webscraper.io/?utm_source=extension&utm_medium=help")
      }, "Upvote Feature Ideas")))), u.appState.experimentalFeaturesEnabled && a.default.createElement("li", null, a.default.createElement("a", null, "Experimental features enabled"))), a.default.createElement(d, null)));
    }));
  },
  76e3: function(e, t, r) {
    "use strict";
    var n = this && this.__importDefault || function(e) {
      return e && e.__esModule ? e : {
        default: e
      };
    };
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.BackgroundScriptErrorMessageAlert = void 0;
    const o = n(r(96540)),
      i = r(44015),
      a = r(24567),
      s = r(82226);
    t.BackgroundScriptErrorMessageAlert = (0, i.observer)((() => a.Obj.empty(s.appState.backgroundScriptErrors) ? o.default.createElement(o.default.Fragment, null) : o.default.createElement("div", {
      className: "alert alert-danger error-alert",
      role: "alert"
    }, o.default.createElement("span", null, "Error:"), o.default.createElement("ul", null, o.default.createElement(l, null)), o.default.createElement("button", {
      type: "button",
      className: "close close-error-alert",
      onClick: () => {
        s.appState.clearErrors();
      }
    }, o.default.createElement("span", {
      "aria-hidden": "true"
    }, "\xd7")))));
    const l = (0, i.observer)((() => {
      const {
        backgroundScriptErrors: e
      } = s.appState;
      return o.default.createElement(o.default.Fragment, null, Object.keys(e).map(((t, r) => e[t].map((e => o.default.createElement("li", {
        key: r
      }, e))))));
    }));
  },
