/**
 * Content Script Module: SelectionLimiter
 * Source module ID: 49766
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

49766: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectionLimiter = void 0;
  t.SelectionLimiter = class {
    elementTagsAllowed(e, t) {
      let n = !1;
      for (const r of t)
        if (e.tagName.toLowerCase() === r.toLowerCase()) {
          n = !0;
          break;
        }
      return n;
    }
  };
},