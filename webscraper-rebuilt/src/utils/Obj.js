/**
 * Module: Obj
 * Source module ID: 24567
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

24567: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Obj = void 0;
  const n = r(789);
  class i {
    static clone(e) {
      if (!e) return e;
      return JSON.parse(JSON.stringify(e));
    }
    static diffWouldUpdate(e, t) {
      const r = {};
      for (const n in t) e[n] !== t[n] && (r[n] = t[n]);
      return r;
    }
    static diffWouldNotUpdate(e, t) {
      const r = {};
      for (const n in t) e[n] === t[n] && (r[n] = t[n]);
      return r;
    }
    static empty(e) {
      return 0 === Object.entries(e).length;
    }
    static recursiveKeySort(e) {
      if (null == e) return e;
      const t = {};
      Object.setPrototypeOf(t, e);
      const r = Object.keys(e);
      r.sort();
      for (const n of r) {
        let r = e[n];
        if (Array.isArray(r))
          for (let e = 0; e < r.length; e++) "object" == typeof r[e] && (r[e] = i.recursiveKeySort(r[e]));
        else "object" == typeof r && (r = i.recursiveKeySort(r));
        t[n] = r;
      }
      return t;
    }
    static getSize(e) {
      const t = JSON.stringify(e);
      return n.Str.getSize(t);
    }
    static getHash(e) {
      const t = JSON.stringify(e);
      return n.Str.getHash(t);
    }
    static deepUpdate(e, t, r) {
      const n = t.shift();
      if (!i.isObject(e) || !(n in e)) throw new Error("Specified path does not exist in the object");
      0 !== t.length ? i.deepUpdate(e[n], t, r) : e[n] = r;
    }
    static isObject(e) {
      return "object" == typeof e && null !== e;
    }
    static stringify(e) {
      return "object" == typeof e ? JSON.stringify(e) : "number" == typeof e ? e : void 0 !== e ? e.toString() : void 0;
    }
  }
  t.Obj = i;
},