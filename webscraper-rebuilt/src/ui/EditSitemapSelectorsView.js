/**
 * UI Component: EditSitemapSelectorsView
 * Source module ID: 85656
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

85656: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.EditSitemapSelectorsView = void 0;
  const o = n(r(96540)),
    i = r(92909),
    a = r(9648),
    s = r(33631);
  t.EditSitemapSelectorsView = () => o.default.createElement(a.DndProvider, {
    backend: s.HTML5Backend
  }, o.default.createElement(i.SelectorList, null));
},