/**
 * Module: Browser
 * Source module ID: 87594
 * Category: background
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

87594: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Browser = void 0;
  class r {
    static isChrome() {
      return /google inc/.test(globalThis.navigator.vendor.toLowerCase());
    }
    static isFirefox() {
      return globalThis.navigator.userAgent.toLowerCase().includes("firefox");
    }
    static getChromeVersion() {
      var e, t;
      if (!r.isChrome()) return;
      const n = null === (e = globalThis.navigator.userAgentData) || void 0 === e ? void 0 : e.brands.find((e => "Google Chrome" === e.brand));
      if (n) return parseInt(n.version, 10);
      const i = null === (t = globalThis.navigator.userAgent) || void 0 === t ? void 0 : t.match(/(chrome|edg)\/(\d+)/i);
      return i ? parseInt(i[2], 10) : void 0;
    }
  }
  t.Browser = r;
},