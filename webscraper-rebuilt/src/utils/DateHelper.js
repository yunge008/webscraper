/**
 * Module: DateHelper
 * Source module ID: 54644
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

54644: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.DateHelper = void 0;
  const n = r(70259);
  t.DateHelper = class {
    static getDate(e) {
      let t;
      t = void 0 === e ? new Date : new Date(e);
      const r = String(t.getDate()).padStart(2, "0"),
        n = String(t.getMonth() + 1).padStart(2, "0");
      return `${t.getFullYear()}-${n}-${r}`;
    }
    static getLastFullMinuteTimestamp(e) {
      return e - e % n.TIME.ONE_MINUTE_MS;
    }
  };
},