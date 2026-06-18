/**
 * Module: CSSSelectorHelper
 * Source module ID: 9712
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

9712: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.CSSSelectorHelper = void 0;
  t.CSSSelectorHelper = class {
    static getContainsSelectorStr(e) {
      const t = (e = (e = e.trim()).replace(/([\\'])/g, "\\$1")).split("\n");
      let r = "";
      for (const e of t) {
        e.trim().length > 0 && (r += `:contains('${e.trim()}')`);
      }
      return r;
    }
  };
},