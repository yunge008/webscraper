/**
 * Module: BaseMatcher
 * Source module ID: 49655
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

49655: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.BaseMatcher = void 0;
  t.BaseMatcher = class {
    match(e) {
      const t = this.regex.exec(e.trim());
      if (t) return t[this.matchGroup];
    }
  };
},