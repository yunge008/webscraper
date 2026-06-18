/**
 * UI Component: CloudAuthModal
 * Source module ID: 52674
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

52674: function(e, t, r) {
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
  }), t.CloudAuthModal = void 0;
  const i = o(r(96540)),
    a = r(96540),
    s = r(44015),
    l = o(r(74692)),
    c = r(1757),
    u = r(82226);
  t.CloudAuthModal = (0, s.observer)((() => {
    const e = (0, c.useLocation)(),
      t = (0, a.useRef)(),
      {
        authModalVisible: r
      } = u.appState,
      o = (0,
        a.useCallback)((() => n(void 0, void 0, void 0, (function*() {
        yield u.appState.loadSitemaps(), u.appState.isSitemapSyncEnabled() && (0, l.default)(t.current).modal("hide");
      }))), [u.appState, t]);
    return (0, a.useEffect)((() => {
      r && (0, l.default)(t.current).modal("show"), (0, l.default)(t.current).modal().on("hidden.bs.modal", (() => {
        u.appState.hideAuthModal();
      }));
    }), [r]), r && "/" === e.pathname ? i.default.createElement("div", {
      ref: t,
      className: "modal fade cloud-auth-modal"
    }, i.default.createElement("div", {
      className: "modal-dialog"
    }, i.default.createElement("div", {
      className: "modal-content"
    }, i.default.createElement("div", {
      className: "modal-header"
    }, i.default.createElement("h4", {
      className: "modal-title"
    }, "After successfully connecting extension to your Cloud account, reload the sitemap list.")), i.default.createElement("div", {
      className: "modal-body"
    }, i.default.createElement("button", {
      type: "button",
      className: "btn btn-primary reload-auth-modal",
      onClick: o
    }, "Reload"), i.default.createElement("button", {
      type: "button",
      className: "btn btn-default close-auth-modal",
      "data-dismiss": "modal",
      "aria-hidden": "true"
    }, "Close"))))) : i.default.createElement(i.default.Fragment, null);
  }));
},