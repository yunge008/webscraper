/**
 * Module: ParentSelector
 * Source module ID: 13816
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

13816: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ParentSelector = void 0;
  const n = r(39976);
  class i extends n.ElementSelector {
    getCssSelector(e = !0) {
      return "_parent_";
    }
    merge() {}
  }
  t.ParentSelector = i;
},