/**
 * Module: SelectorOptimizer
 * Source module ID: 14288
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

14288: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorOptimizer = void 0;
  const i = n(r(81950));
  class o {
    static optimize(e) {
      const t = i.default.parse(e);
      return o.reorderSelectors(t) ? i.default.stringify(t) : e;
    }
    static reorderSelectors(e) {
      let t = !1;
      for (const r of e.nodes) {
        const e = r.nodes;
        let n = 0;
        for (let r = 0; r < e.length; r++) {
          const i = e[r];
          if ("invalid" === i.type) return !1;
          if ("nested-pseudo-class" === i.type) {
            o.reorderSelectors(i) && (t = !0);
          }
          if ("spacing" !== i.type && "operator" !== i.type || (n = r + 1), 0 !== r && o.optimizationAllowed(i) && r !== n) {
            const i = e.splice(r, 1)[0];
            e.splice(n, 0, i), t = !0;
          }
        }
      }
      return t;
    }
    static optimizationAllowed(e) {
      return o.ALLOWED_NODE_TYPES.includes(e.type) && o.ALLOWED_PSEUDO_CLASSES.includes(e.name);
    }
  }
  t.SelectorOptimizer = o, o.ALLOWED_NODE_TYPES = ["pseudo-class", "nested-pseudo-class"],
    o.ALLOWED_PSEUDO_CLASSES = ["contains", "has", "not"];
},