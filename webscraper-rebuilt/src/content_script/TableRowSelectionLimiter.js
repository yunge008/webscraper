/**
 * Content Script Module: TableRowSelectionLimiter
 * Source module ID: 81286
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

81286: (e, t, n) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.TableRowSelectionLimiter = void 0;
  const r = n(49766);
  class i extends r.SelectionLimiter {
    elementCanBeSelected(e) {
      return this.elementTagsAllowed(e, ["tr"]);
    }
  }
  t.TableRowSelectionLimiter = i;
},