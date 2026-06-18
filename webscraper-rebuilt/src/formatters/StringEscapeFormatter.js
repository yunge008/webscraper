/**
 * Module: StringEscapeFormatter
 * Source module ID: 21502
 * Category: formatters
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

21502: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.StringEscapeFormatter = void 0;
  const n = r(37247);
  class i extends n.BaseDataFormatter {
    constructor({
      searchValue: e,
      replaceValue: t
    }) {
      super(), this.searchValue = e, this.replaceValue = null != t ? t : "";
    }
    format(e) {
      return this.searchValue && void 0 !== e && "boolean" != typeof e ? Array.isArray(e) ? e.map((e => e.replace(this.searchValue, this.replaceValue))) : e.replace(this.searchValue, this.replaceValue) : e;
    }
  }
  t.StringEscapeFormatter = i;
},