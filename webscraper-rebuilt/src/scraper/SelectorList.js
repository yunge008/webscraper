/**
 * Module: SelectorList
 * Source module ID: 70419
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

70419: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorList = void 0;
  const n = r(90711),
    i = r(1969),
    o = r(74161),
    s = r(39153);
  class a extends Array {
    constructor(e) {
      if (super(), Object.setPrototypeOf(this, Object.create(a.prototype)), Array.isArray(e))
        for (const t of e)
          if (void 0 !== t)
            if (Array.isArray(t))
              for (const e of t) this.push(e);
            else this.push(t);
    }
    push(...e) {
      for (let t of e)
        if (!this.hasSelector(t.id)) {
          if (!(t instanceof n.Selector)) try {
            t = (0, i.selectorFactory)(t);
          } catch (e) {
            o.Log.warning(s.Err.getMessage(e));
            continue;
          }
          Array.prototype.push.call(this, t);
        }
      return this.length;
    }
    hasSelector(e) {
      e instanceof Object && (e = e.id);
      for (let t = 0; t < this.length; t++)
        if (this[t].id === e) return !0;
      return !1;
    }
    getAllSelectors(e) {
      if (void 0 === e) return this;
      const t = (e, r) => {
          for (const n of this) n.hasParentSelector(e) && (r.includes(n) || (r.push(n), t(n.id, r)));
        },
        r = [];
      return t(e, r), r;
    }
    getDirectChildSelectors(e) {
      const t = new a([]);
      for (const r of this) r.hasParentSelector(e) && t.push(r);
      return t;
    }
    clone() {
      const e = new a([]);
      for (const t of this) e.push(t);
      return e;
    }
    fullClone() {
      const e = new a([]);
      for (const t of this) e.push(JSON.parse(JSON.stringify(t)));
      return e;
    }
    concat(...e) {
      const t = this.clone();
      for (const r in e)
        for (const n of e[r]) t.push(n);
      return t;
    }
    getSelector(e) {
      for (let t = 0; t < this.length; t++) {
        const r = this[t];
        if (r.id === e) return r;
      }
    }
    getOnePageSelectors(e) {
      let t = new a([]);
      const r = this.getSelector(e);
      t.push(this.getSelector(e));
      const n = function(e) {
        for (const r of e.parentSelectors) {
          if ("_root" === r) return;
          const e = this.getSelector(r);
          if (t.includes(e)) return;
          e.willReturnElements() && (t.push(e), n(e));
        }
      }.bind(this);
      n(r);
      const i = this.getSinglePageAllChildSelectors(r.id);
      return t = t.concat(i), t;
    }
    getSinglePageAllChildSelectors(e) {
      const t = new a([]),
        r = function(e) {
          if (e.willReturnElements()) {
            const n = this.getDirectChildSelectors(e.id);
            for (const e of n) t.includes(e) || (t.push(e), r(e));
          }
        }.bind(this),
        n = this.getSelector(e);
      return r(n), t;
    }
    willReturnMultipleRecords(e) {
      if (!0 === this.getSelector(e).willReturnMultipleRecords()) return !0;
      const t = this.getAllSelectors(e);
      for (const e of t)
        if (!0 === e.willReturnMultipleRecords()) return !0;
      return !1;
    }
    toJSON() {
      const e = [];
      for (const t of this) e.push(t);
      return e;
    }
    getSelectorById(e) {
      for (let t = 0; t < this.length; t++) {
        const r = this[t];
        if (r.id === e) return r;
      }
      return null;
    }
    getCSSSelectorWithinOnePage(e, t) {
      let r = this.getSelector(e).selector;
      return r = this.getParentCSSSelectorWithinOnePage(t) + r, r;
    }
    getParentCSSSelectorWithinOnePage(e) {
      let t = "";
      for (let r = e.length - 1; r > 0; r--) {
        const n = e[r],
          i = this.getSelector(n);
        if (!i.willReturnElements()) break;
        "_parent_" !== i.selector.trim() && (t = `${i.selector} ${t}`);
      }
      return t;
    }
    hasRecursiveElementSelectors() {
      let e = !1;
      for (const t of this) {
        const r = [],
          n = t => {
            if (r.includes(t)) e = !0;
            else if (t.willReturnElements()) {
              r.push(t);
              const e = this.getDirectChildSelectors(t.id);
              for (const t of e) n(t);
              r.pop();
            }
          };
        n(t);
      }
      return e;
    }
  }
  t.SelectorList = a;
},