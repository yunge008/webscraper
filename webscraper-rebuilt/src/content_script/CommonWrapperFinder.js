/**
 * Content Script Module: CommonWrapperFinder
 * Source module ID: 41609
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

41609: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.CommonWrapperFinder = void 0;
  t.CommonWrapperFinder = class {
    constructor(e) {
      this.elementReferences = e;
    }
    findElementWrappers(e) {
      const t = [];
      for (const n of e) t.push(this.elementReferences.getElementByReference(n));
      if (0 === t.length) return [];
      return this.findCommonParents(t).map((e => this.elementReferences.getElementReference(e)));
    }
    findCommonParents(e) {
      if (0 === e.length) throw new Error("No elements provided");
      let t = [...e];
      for (;;) {
        const e = new Set;
        for (const n of t) {
          if (!n.parentElement) break;
          e.add(n.parentElement);
        }
        if (t.length !== e.size) break;
        t = Array.from(e);
      }
      return t;
    }
  };
},