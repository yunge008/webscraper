/**
 * Module: formatterFactory
 * Source module ID: 77054
 * Category: formatters
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

77054: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.formatterFactory = function(e) {
    switch (e.type) {
      case "StringEscapeFormatter":
        return new o.StringEscapeFormatter(e.args);

      case "ArrayJoinFormatter":
        return new i.ArrayJoinFormatter(e.args);

      default:
        return new n.BaseDataFormatter;
    }
  };
  const n = r(37247),
    i = r(53717),
    o = r(21502);
},