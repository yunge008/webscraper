/**
 * Module: LinksFromTextExtractor
 * Source module ID: 78171
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

78171: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.LinksFromTextExtractor = void 0;
  const i = n(r(61160)),
    o = r(90195);
  t.LinksFromTextExtractor = class {
    constructor() {
      this.pattern = new RegExp(/https?:\/\/[^\s]+/, "gi");
    }
    extract(e) {
      if (!e) return [];
      const t = e.match(this.pattern);
      if (!t) return [];
      const r = [];
      for (const e of t) {
        const t = (0, i.default)(e);
        if (t && t.protocol && t.hostname) {
          const t = o.Url.escapeWhiteSpace(e);
          r.push(t);
        }
      }
      return r;
    }
  };
},