/**
 * Module: TypeTransformer
 * Source module ID: 78079
 * Category: formatters
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

78079: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.TypeTransformer = void 0;
  t.TypeTransformer = class {
    static nullToUndefined(e) {
      if (null !== e) return e;
    }
    static undefinedToEmptyString(e) {
      const t = JSON.stringify(e, ((e, t) => void 0 === t ? "" : t));
      return JSON.parse(t);
    }
  };
},