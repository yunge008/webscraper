/**
 * Module: PasswordHash
 * Source module ID: 51783
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

51783: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.PasswordHash = void 0;
  const n = r(17871),
    i = r(789);
  t.PasswordHash = class {
    static hashPassword(e) {
      const t = i.Str.getHash(e);
      return (0, n.hashSync)(t, "$2a$12$zq7UwZRnUTKBS11481SlOL");
    }
  };
},