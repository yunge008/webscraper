/**
 * Content Script Module: BaseSelectionLimiter
 * Source module ID: 63891
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

63891: (e, t, n) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.BaseSelectionLimiter = void 0;
  const r = n(49766);
  class i extends r.SelectionLimiter {
    elementCanBeSelected(e) {
      return !0;
    }
  }
  t.BaseSelectionLimiter = i;
},