/**
 * Module: SelectorDataParser
 * Source module ID: 66512
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

66512: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorDataParser = void 0;
  const n = r(77054);
  t.SelectorDataParser = class {
    constructor(e, t, r) {
      this.formatters = {}, this.initFormatters(t, e, r);
    }
    parseData(e) {
      const t = [];
      for (const r of e) this.formatRow(r), this.addEmptyColumns(r), t.push(r);
      return t;
    }
    initFormatters(e, t, r) {
      let i = [];
      i = e ? t.getDataPreviewSelectors(e, r) : t.getAllSelectors("_root");
      for (const e of i) {
        const t = e.getFormatters();
        for (const e in t) {
          const r = [];
          for (const i of t[e]) r.push((0, n.formatterFactory)(i));
          this.formatters[e] = r;
        }
      }
    }
    formatRow(e) {
      for (const t in e) {
        const r = this.formatters[t];
        if (r)
          for (const n of r) e[t] = n.format(e[t]);
      }
    }
    addEmptyColumns(e) {
      for (const t in this.formatters) void 0 === e[t] && (e[t] = "");
    }
  };
},