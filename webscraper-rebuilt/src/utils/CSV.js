/**
 * Module: CSV
 * Source module ID: 92922
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

92922: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.CSV = void 0;
  class r {
    static escapeString(e) {
      return e.replace(/"/g, '""');
    }
    static encodeValue(e) {
      let t = "";
      return t = null == e ? "" : "object" == typeof e ? JSON.stringify(e) : `${e}`.trim(),
        t = r.escapeString(t), `"${t}"`;
    }
    static getCsvDataArray(e, t) {
      const n = ["\ufeff"],
        i = [...t];
      "web-scraper-order" === i[0] && (i[0] = "web_scraper_order", i[1] = "web_scraper_start_url"),
        n.push(i.join(",") + "\r\n");
      for (const i of e) {
        const e = [];
        for (const n of t) {
          const t = r.encodeValue(i[n]);
          e.push(t);
        }
        n.push(e.join(",") + "\r\n");
      }
      return n;
    }
    static getCsvBlob(e, t) {
      const n = r.getCsvDataArray(e, t);
      return new Blob(n, {
        type: "text/csv"
      });
    }
  }
  t.CSV = r;
},