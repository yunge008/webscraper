/**
 * Module: LocationReplacementMatcher
 * Source module ID: 57725
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

57725: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.LocationReplacementMatcher = void 0;
  const n = r(49655);
  class i extends n.BaseMatcher {
    constructor() {
      super(...arguments), this.regex = new RegExp(/^(?:window\.)?location\.replace\s*\(\s*(["'])(.+?)\1\s*\)\s*;?\s*$/, "g"),
        this.matchGroup = 2;
    }
  }
  t.LocationReplacementMatcher = i;
},