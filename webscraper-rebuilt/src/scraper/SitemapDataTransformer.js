/**
 * Module: SitemapDataTransformer
 * Source module ID: 69536
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

69536: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SitemapDataTransformer = void 0;
  const n = r(70259);
  t.SitemapDataTransformer = class {
    static addIdField(e) {
      const t = [];
      for (const r of e) r._id = r["web-scraper-order"], t.push(r);
      return t;
    }
    static buildDbName(e) {
      return `sitemap-data-${e.replace(/[^a-z0-9_$()+\-/]/gi, "_")}`;
    }
    static populateDataPreviewData(e, t) {
      const r = Math.round(Date.now() / n.TIME.ONE_SECOND_MS);
      let i = 0;
      const o = [];
      for (const n of t) o.push(Object.assign(Object.assign({
        "web-scraper-order": `${r}-${++i}`,
        "web-scraper-start-url": e
      }, n), {
        _id: `${r}-${i}`
      }));
      return o;
    }
  };
},