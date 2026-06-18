/**
 * Module: CssClassAnalyzer
 * Source module ID: 1314
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

1314: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.CssClassAnalyzer = void 0;
  const r = /^_|^(y-)?[ctj]ss|^sc-|^data-ng-|^ng-|^r-|^mui-|^Mui-|[0-9][a-wy-zA-Z\-\_]+[0-9]|[A-Z]{3,}|[A-Z][a-z][A-Z]|[0-9]+[A-Z]/g;
  t.CssClassAnalyzer = class {
    isGenerated(e) {
      return null !== e.match(r);
    }
  };
},