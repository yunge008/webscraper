/**
 * Module: CssSelector
 * Source module ID: 31507
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

31507: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.CssSelector = void 0;
  const n = r(39976),
    i = r(32949),
    o = r(13816),
    s = r(33741),
    a = r(84207),
    l = r(74161);
  t.CssSelector = class {
    constructor(e) {
      e.parent ? this.setParent(e.parent) : this.parent = new Set([document]), this.ignoredTags = e.ignoredTags || [],
        this.ignoredClassBase = e.ignoredClassBase || !1, this.enableResultStripping = void 0 === e.enableResultStripping || e.enableResultStripping,
        this.enableSmartTableSelector = e.enableSmartTableSelector || !1, this.ignoredClasses = e.ignoredClasses || [],
        this.query = e.query;
    }
    setParent(e) {
      if (Array.isArray(e)) {
        if (0 === e.length) throw new i.SelectionError("Parent elements not found! Check parent selector.");
        this.parent = new Set(e);
      } else this.parent = new Set([e]);
    }
    mergeElementSelectorLists(e) {
      if (e.length < 1) throw new i.SelectionError("No selectors specified");
      if (1 === e.length) return e[0];
      const t = e[0].length;
      for (const r of e)
        if (r.length !== t) throw new i.SelectionError("Invalid element count in selector");
      const r = e[0];
      for (let n = 1; n < e.length; n++) {
        const i = e[n];
        for (let e = 0; e < t; e++) r[e].merge(i[e]);
      }
      return r;
    }
    stripSelector(e, t) {
      const r = this.getCssSelectorFromElementSelectorList(e),
        n = new Set(this.query(r));
      n.size !== t && a.isNodeJs && 0 === n.size && l.Log.warning("Generated css selector fails to extract any element", {
        expectedElementCount: t,
        cssSelector: r
      });
      const i = this.getSelectorTransformersForStripping(e);
      this.recursiveBinarySearchExecuteTransformers(n, e, i, 0, i.length - 1, 0, !0);
    }
    getElementSelectors(e, t) {
      const r = [];
      for (const n of e) {
        const e = this.getElementSelectorList(n, t);
        r.push(e);
      }
      return r;
    }
    getElementSelectorList(e, t) {
      const r = [];
      if (this.shouldAddParent(e, t)) {
        const t = new o.ParentSelector(e, this.ignoredClasses, !1);
        return r.push(t), r;
      }
      for (; !this.parent.has(e);) {
        if (void 0 === e || "#document" === e.nodeName) throw new i.SelectionError("Selected element is not a child of the given parent.");
        if (this.isIgnoredTag(e.tagName)) {
          e = e.parentNode;
          continue;
        }
        if (t > 0) {
          t--, (e = e.parentNode) instanceof ShadowRoot && (e = e.host);
          continue;
        }
        const o = new n.ElementSelector(e, this.ignoredClasses, this.enableSmartTableSelector);
        ("#document" === e.parentNode.nodeName || this.isIgnoredTag(e.parentNode.tagName)) && (o.isDirectChild = !1),
        r.push(o), e = e.parentNode, "undefined" != typeof ShadowRoot && e instanceof ShadowRoot && (e = e.host,
          o.isDirectChild = !1);
      }
      return r;
    }
    checkSimilarElements(e, t) {
      for (;;) {
        if (void 0 === e || void 0 === t) return !1;
        if (e.tagName !== t.tagName) return !1;
        if (e === t) return !0;
        if ("body" === e.tagName.toLowerCase()) return !1;
        if ("body" === t.tagName.toLowerCase()) return !1;
        e = e.parentNode, t = t.parentNode;
      }
    }
    getElementGroups(e) {
      const t = [
        [e[0]]
      ];
      for (let r = 1; r < e.length; r++) {
        const n = e[r];
        let i = !1;
        for (const e of t) {
          const t = e[0];
          if (this.checkSimilarElements(n, t)) {
            e.push(n), i = !0;
            break;
          }
        }
        i || t.push([n]);
      }
      return t;
    }
    getCssSelector(e, t = 0, r = !1) {
      const n = this.enableSmartTableSelector;
      e.length > 1 && (this.enableSmartTableSelector = !1);
      const o = this.getElementGroups(e);
      let s;
      if (r) {
        const r = [];
        for (const n of o) {
          const i = this.getElementSelectors(n, t),
            o = this.mergeElementSelectorLists(i);
          this.enableResultStripping && this.stripSelector(o, e.length), r.push(this.getCssSelectorFromElementSelectorList(o));
        }
        s = r.join(", ");
      } else {
        if (1 !== o.length) throw new i.SelectionError("Shift and click to select multiple element groups");
        const r = this.getElementSelectors(e, t),
          n = this.mergeElementSelectorLists(r);
        this.enableResultStripping && this.stripSelector(n, e.length), s = this.getCssSelectorFromElementSelectorList(n);
      }
      return this.enableSmartTableSelector = n, s;
    }
    isIgnoredTag(e) {
      return e && this.ignoredTags.includes(e.toLowerCase());
    }
    shouldAddParent(e, t) {
      for (let r = 0; r < t; r++)
        if (e.parentElement) e = e.parentElement;
        else {
          const t = e.getRootNode();
          e = t.host;
        }
      return this.parent.has(e);
    }
    getCssSelectorFromElementSelectorList(e) {
      const t = [];
      let r = !1;
      for (let n = e.length - 1; n >= 0; n--) {
        const i = e[n];
        if (null === i) {
          r = !0;
          continue;
        }
        const o = i.getCssSelector(r);
        o ? (t.push(o), r = !1) : r = !0;
      }
      return t.join(" ").replace(/:shadow-root$/, "");
    }
    elementsMatch(e, t) {
      if (e.size !== t.length) return !1;
      for (const r of t)
        if (!e.has(r)) return !1;
      return !0;
    }
    getSelectorTransformersForStripping(e) {
      const t = [],
        r = [],
        n = [],
        i = [],
        o = [];
      for (let a = e.length - 1; a >= 0; a--) {
        const l = e[a];
        t.push(new s.ElementSelectorTransformer(l, "index")), r.push(new s.ElementSelectorTransformer(l, "isDirectChild"));
        for (const e of l.generatedClasses) o.push(new s.ElementSelectorTransformer(l, "generatedClass", e));
        for (const e of l.attributes) n.push(new s.ElementSelectorTransformer(l, "attribute", e));
        0 !== a && i.push(new s.ElementSelectorTransformer(l, "tag")), l.previousSiblingText && i.push(new s.ElementSelectorTransformer(l, "previousSiblingText")),
          l.id && i.push(new s.ElementSelectorTransformer(l, "id"));
        for (const e of l.classes) i.push(new s.ElementSelectorTransformer(l, "class", e));
        for (const e of l.schemaOrgAttributes) i.push(new s.ElementSelectorTransformer(l, "schemaOrgAttribute", e));
        for (const e of l.betterThanClassesAttributes) i.push(new s.ElementSelectorTransformer(l, "betterThanClassesAttribute", e));
      }
      return [...t, ...r, ...o, ...n, ...i];
    }
    recursiveBinarySearchExecuteTransformers(e, t, r, n, i, o, s = !1) {
      if (!s) {
        for (let e = n; e <= i; e++) r[e].disable();
        const o = this.getCssSelectorFromElementSelectorList(t),
          s = this.query(o);
        if (0 === s.length && a.isNodeJs && l.Log.warning("Generated css selector fails to extract any element", {
            cssSelector: o
          }), this.elementsMatch(e, s)) return !0;
        for (let e = n; e <= i; e++) r[e].rollback();
        if (n === i) return !1;
      }
      const c = Math.floor((n + i) / 2),
        u = this.recursiveBinarySearchExecuteTransformers(e, t, r, n, c, o + 1);
      if (u && o > 0 && i === c + 1) return !1;
      const d = u && o > 0;
      return this.recursiveBinarySearchExecuteTransformers(e, t, r, c + 1, i, o + 1, d),
        !1;
    }
  };
},