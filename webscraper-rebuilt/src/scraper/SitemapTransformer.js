/**
 * Module: SitemapTransformer
 * Source module ID: 97152
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

97152: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SitemapTransformer = void 0;
  const n = r(45431);
  t.SitemapTransformer = class {
    static toSitemapArray(e) {
      const t = [];
      for (const r of e) {
        const e = new n.Sitemap(r);
        t.push(e);
      }
      return t;
    }
    static toSitemapMetadataArray(e) {
      const t = [];
      for (const r of e) {
        const e = new n.Sitemap(r),
          i = {
            domain: e.getFirstStartUrlDomain(),
            hashHistory: e.hashHistory,
            name: e._id,
            localStorage: !0
          };
        t.push(i);
      }
      return t;
    }
  };
},