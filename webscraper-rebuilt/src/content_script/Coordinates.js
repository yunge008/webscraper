/**
 * Content Script Module: Coordinates
 * Source module ID: 91621
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

91621: (e, t, n) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Coordinates = void 0;
  const r = n(87594);
  class i {
    static pointWithinElement(e, t, n) {
      const {
        top: r,
        bottom: o,
        left: a,
        right: s
      } = e.getBoundingClientRect(), l = i.getWindowZoom();
      return t <= s * l && t >= a * l && n <= o * l && n >= r * l;
    }
    static getWindowZoom() {
      let e = 1;
      if (window.chrome && r.Browser.getChromeVersion() < 128) {
        const t = Math.round(100 * Number(window.getComputedStyle(document.querySelector("html")).zoom)) / 100;
        t !== Math.round(100 * window.devicePixelRatio) / 100 && (e = t);
      }
      return e;
    }
    static getElementCoordinates(e) {
      const t = e.getBoundingClientRect(),
        n = Math.floor(t.left + .5 * t.width),
        r = Math.floor(t.top + .5 * t.height);
      return {
        clientX: n,
        clientY: r,
        screenX: n + Math.floor(window.screenX),
        screenY: r + Math.floor(window.screenY)
      };
    }
  }
  t.Coordinates = i;
},