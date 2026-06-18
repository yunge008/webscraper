/**
 * Module: ElementQuery
 * Source module ID: 7294
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

7294: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ElementQuery = void 0;
  const i = r(39153),
    o = n(r(74692));
  class s {
    static find(e, t, r = o.default) {
      try {
        if (e = e || "", !s.selectorNeedsSpecialHandling(e)) return r(e, t).get();
        const n = [],
          i = s.getSelectorParts(e, [","]);
        for (const o of i) {
          if ("_parent_" === o) {
            if (!t) throw new Error("Parent element is missing with _parent_ selector");
            s.addElementToList(t, n);
            continue;
          }
          if (!s.selectorNeedsSplitExtractionHandling(o)) {
            const e = r(o, t).get();
            s.addElementsToList(e, n);
            continue;
          }
          const i = s.extractElementsWithSplitExtractionSelector(e, t, r);
          s.addElementsToList(i, n);
        }
        return n;
      } catch (e) {
        throw `ELEMENT_SELECTION_ERROR ${i.Err.getMessage(e)}`;
      }
    }
    static findMultipleParents(e, t) {
      const r = [];
      for (const n of t) {
        const t = s.find(e, n);
        r.push(...t);
      }
      return r;
    }
    static selectorNeedsSpecialHandling(e) {
      const t = e.split(/(_parent_|:shadow-root|:iframe|".*?"|'.*?'|\(.*?\))/);
      for (const e of t)
        if ("_parent_" === e || ":shadow-root" === e || ":iframe" === e) return !0;
      return !1;
    }
    static selectorNeedsSplitExtractionHandling(e) {
      const t = e.split(/(:shadow-root|:iframe|".*?"|'.*?'|\(.*?\))/);
      for (const e of t)
        if (":shadow-root" === e || ":iframe" === e) return !0;
      return !1;
    }
    static getSelectorParts(e, t, r = !1) {
      const n = t.map((e => `(?<!\\\\)${e}`)).join("|"),
        i = new RegExp(`(${n}|".*?"|'.*?'|\\(.*?\\))`),
        o = e.split(i),
        s = [];
      let a = "";
      for (const e of o) t.includes(e) ? (a.trim().length && s.push(a.trim()), r && s.push(e),
        a = "") : a += e;
      return a.trim().length && s.push(a.trim()), s;
    }
    static getShadowRoot(e) {
      return s.getOpenShadowRoot(e) || s.getChromeShadowRoot(e) || s.getFirefoxShadowRoot(e);
    }
    static extractElementsWithSplitExtractionSelector(e, t, r) {
      let n = [t];
      const i = s.getSelectorParts(e, [":shadow-root", ":iframe"], !0);
      for (const e of i)
        if (":shadow-root" === e) {
          const e = [];
          for (const t of n) {
            const r = s.getShadowRoot(t);
            r && e.push(r);
          }
          n = e;
        } else if (":iframe" === e) {
        const e = [];
        for (const t of n) t.contentDocument && e.push(t.contentDocument);
        n = e;
      } else n = r(e, n).get();
      return n;
    }
    static getOpenShadowRoot(e) {
      return e.shadowRoot;
    }
    static getChromeShadowRoot(e) {
      if ("undefined" != typeof chrome && chrome.dom && chrome.dom.openOrClosedShadowRoot) try {
        return chrome.dom.openOrClosedShadowRoot(e);
      } catch (e) {}
    }
    static getFirefoxShadowRoot(e) {
      return e.openOrClosedShadowRoot;
    }
    static addElementToList(e, t) {
      t.includes(e) || t.push(e);
    }
    static addElementsToList(e, t) {
      for (const r of e) s.addElementToList(r, t);
    }
  }
  t.ElementQuery = s;
},