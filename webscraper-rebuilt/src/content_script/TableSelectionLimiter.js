/**
 * Content Script Module: TableSelectionLimiter
 * Source module ID: 68468
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

68468: (e, t, n) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.TableSelectionLimiter = void 0;
  const r = n(49766);
  class i extends r.SelectionLimiter {
    elementCanBeSelected(e) {
      return this.elementTagsAllowed(e, ["table"]);
    }
  }
  t.TableSelectionLimiter = i;
},