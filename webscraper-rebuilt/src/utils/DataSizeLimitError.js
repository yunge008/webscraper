/**
 * Module: DataSizeLimitError
 * Source module ID: 49030
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

49030: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.DataSizeLimitError = void 0;
  class r extends Error {
    constructor(e, t) {
      super(e), this.size = t;
    }
  }
  t.DataSizeLimitError = r;
},