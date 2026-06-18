/**
 * Module: SitemapSelectorCssStringBuilder
 * Source module ID: 61083
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

61083: function(e, t) {
  "use strict";
  var r = this && this.__awaiter || function(e, t, r, n) {
    return new(r || (r = Promise))((function(i, o) {
      function s(e) {
        try {
          l(n.next(e));
        } catch (e) {
          o(e);
        }
      }

      function a(e) {
        try {
          l(n.throw(e));
        } catch (e) {
          o(e);
        }
      }

      function l(e) {
        var t;
        e.done ? i(e.value) : (t = e.value, t instanceof r ? t : new r((function(e) {
          e(t);
        }))).then(s, a);
      }
      l((n = n.apply(e, t || [])).next());
    }));
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SitemapSelectorCssStringBuilder = void 0;
  class n {
    static getCssSelectors(e, t) {
      return r(this, void 0, void 0, (function*() {
        const r = t.selectors.fullClone();
        return (yield n.buildCssSelectorFromParent(e, r)).join(", ");
      }));
    }
    static buildCssSelectorFromParent(e, t) {
      return r(this, void 0, void 0, (function*() {
        const r = [];
        for (const i of t) {
          if (!i.parentSelectors.includes(e)) continue;
          r.push(i.selector);
          const o = t.filter((e => e.id !== i.id));
          if (!o.length || i.id === e) continue;
          const s = yield n.buildCssSelectorFromParent(i.id, o);
          s.length && n.prefixChildrenWithParentSelector(i, s, r);
        }
        return r;
      }));
    }
    static prefixChildrenWithParentSelector(e, t, r) {
      if (e.parentSelectors.includes(e.id)) return void r.push(...t);
      const n = r[r.length - 1];
      for (const e of t) r.push(`${n} ${e}`);
    }
  }
  t.SitemapSelectorCssStringBuilder = n;
},