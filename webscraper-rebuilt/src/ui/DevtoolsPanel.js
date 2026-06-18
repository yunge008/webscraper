/**
 * UI Component: DevtoolsPanel
 * Source module ID: 94587
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

94587: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.DevtoolsPanel = void 0;
  const o = n(r(96540)),
    i = r(96540),
    a = r(30864),
    s = r(15733);
  r(37261), r(62125);
  const l = r(76e3),
    c = r(52674),
    u = r(1757),
    d = r(82226);
  t.DevtoolsPanel = () => {
    const e = (0, u.useLocation)(),
      t = (0, u.useParams)();
    return (0, i.useEffect)((() => {
      d.appState.locationChanged(e, t);
    }), [e, t]), o.default.createElement("div", null, o.default.createElement("div", {
      className: "visible-xs small-screen-info"
    }, o.default.createElement("i", null), o.default.createElement("div", null, o.default.createElement("p", null, "Move developer tools to the bottom of your browser to start using Web Scraper."), o.default.createElement("img", {
      src: "/images/dock-to-bottom.png"
    }))), o.default.createElement("div", {
      className: "hidden-xs"
    }, o.default.createElement(s.Navigation, null), o.default.createElement("div", {
      id: "messages"
    }), o.default.createElement("div", {
      id: "viewport"
    }, o.default.createElement(u.Outlet, null), o.default.createElement(l.BackgroundScriptErrorMessageAlert, null)), o.default.createElement(a.DataPreviewModal, null), o.default.createElement(c.CloudAuthModal, null)));
  };
},