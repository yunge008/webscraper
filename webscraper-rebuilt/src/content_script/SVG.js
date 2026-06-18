/**
 * Content Script Module: SVG
 * Source module ID: 63140
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

63140: (e, t, n) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SVG = void 0;
  const r = n(87594);
  class i {
    static setNamespaceProperties(e, t) {
      for (const n in t) e.setAttributeNS(void 0, n, t[n]);
      return e;
    }
    static getDimensionFromRect(e, t = 1) {
      const {
        x: n,
        y: i,
        height: o,
        width: a
      } = e;
      return r.Browser.getChromeVersion() > 127 ? {
        x: (n / (t = window.getComputedStyle(document.documentElement).zoom)).toString(),
        y: (i / t).toString(),
        height: void 0 !== o ? (o / t).toString() : "0",
        width: void 0 !== a ? (a / t).toString() : "0"
      } : {
        x: (n * t).toString(),
        y: (i * t).toString(),
        height: void 0 !== o ? (o * t).toString() : "0",
        width: void 0 !== a ? (a * t).toString() : "0"
      };
    }
    static getElementZoom(e) {
      if (!window.chrome) return 1;
      let t = window.getComputedStyle(e).zoom;
      const n = e.parentElement;
      return null !== n && "HTML" !== n.tagName && (t *= i.getElementZoom(n)), t;
    }
  }
  t.SVG = i;
},