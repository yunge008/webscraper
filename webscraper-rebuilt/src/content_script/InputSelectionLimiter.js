/**
 * Content Script Module: InputSelectionLimiter
 * Source module ID: 67760
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

67760: (e, t, n) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.InputSelectionLimiter = void 0;
  const r = n(49766);
  class i extends r.SelectionLimiter {
    elementCanBeSelected(e) {
      return this.elementTagsAllowed(e, i.allowedElements);
    }
  }
  t.InputSelectionLimiter = i, i.allowedElements = ["input", "textarea"];
},