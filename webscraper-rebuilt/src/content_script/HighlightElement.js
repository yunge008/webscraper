/**
 * Content Script Module: HighlightElement
 * Source module ID: 10724
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

10724: (e, t, n) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.HighlightElement = void 0;
  const r = n(63140);
  class i {
    constructor(e, t) {
      if (void 0 === e) throw new Error("HTMLElement undefined for HighlightElement constructor.");
      this.element = e instanceof Document ? e.documentElement : e, this.type = t, this.setHighlightId();
    }
    get dimensions() {
      const e = r.SVG.getElementZoom(this.element);
      return r.SVG.getDimensionFromRect(this.element.getBoundingClientRect(), e);
    }
    setHighlightId() {
      this.id = i.counter, i.counter++;
    }
  }
  t.HighlightElement = i, i.counter = 0;
},