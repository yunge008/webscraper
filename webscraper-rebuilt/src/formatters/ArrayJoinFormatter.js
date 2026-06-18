/**
 * Module: ArrayJoinFormatter
 * Source module ID: 53717
 * Category: formatters
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

53717: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ArrayJoinFormatter = void 0;
  const n = r(37247);
  class i extends n.BaseDataFormatter {
    constructor({
      separator: e
    }) {
      super(), this.separator = e;
    }
    format(e) {
      return Array.isArray(e) ? e.join(this.separator) : e;
    }
  }
  t.ArrayJoinFormatter = i;
},