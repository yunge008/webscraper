/**
 * Module: SetHelper
 * Source module ID: 2930
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

2930: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SetHelper = void 0;
  t.SetHelper = class {
    static intersection(e, t) {
      const r = new Set;
      for (const n of e) t.has(n) && r.add(n);
      return r;
    }
    static isSubsetOf(e, t) {
      for (const r of e)
        if (!t.has(r)) return !1;
      return !0;
    }
    static equals(e, t) {
      if (e.size !== t.size) return !1;
      for (const r of e)
        if (!t.has(r)) return !1;
      return !0;
    }
    static hasCommonElement(e, t) {
      for (const r of e)
        if (t.has(r)) return !0;
      return !1;
    }
  };
},