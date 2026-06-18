/**
 * Module: Escape
 * Source module ID: 78979
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

78979: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Escape = void 0;
  class r {
    static specialCharacters(e) {
      return e.replace(/[<>&'"]/g, (e => {
        switch (e) {
          case "<":
            return "&lt;";

          case ">":
            return "&gt;";

          case "&":
            return "&amp;";

          case "'":
            return "&apos;";

          case '"':
            return "&quot;";
        }
      }));
    }
    static controlCharacters(e) {
      return e.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/gu, (e => `_x${e.charCodeAt(0).toString(16).padStart(4, "0000")}_`));
    }
    static charactersForXml(e) {
      return e = void 0 === e ? "" : "string" != typeof e ? JSON.stringify(e) : e.trim(),
        e = r.specialCharacters(e), r.controlCharacters(e);
    }
  }
  t.Escape = r;
},