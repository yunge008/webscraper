/**
 * Module: Sitemap
 * Source module ID: 45431
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

45431: function(e, t, r) {
  "use strict";
  var n = this && this.__awaiter || function(e, t, r, n) {
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
  }), t.Sitemap = void 0;
  const i = r(92922),
    o = r(70419),
    s = r(1969),
    a = r(24567),
    l = r(90195),
    c = r(44623),
    u = r(61083),
    d = r(789),
    h = r(51783);
  class f {
    constructor(e) {
      this.initData(e);
    }
    initData(e) {
      this._id = e._id, this.startUrl = l.Url.fixStartUrls(e.startUrl);
      const t = new o.SelectorList(e.selectors);
      this.selectors = t, this.websiteStateSetup = e.websiteStateSetup, e.hashHistory && e.hashHistory.length > 0 ? this.hashHistory = e.hashHistory : this.setHashHistory();
    }
    toString() {
      let e = JSON.parse(JSON.stringify(this));
      return delete e.hashHistory, e = this.deleteDefaultExperimentalAttributes(e), JSON.stringify(e);
    }
    toJSON() {
      return this.deleteDefaultExperimentalAttributes(this);
    }
    getAllSelectors(e) {
      return this.selectors.getAllSelectors(e);
    }
    getDirectChildSelectors(e) {
      return this.selectors.getDirectChildSelectors(e);
    }
    getSelectorIds() {
      const e = ["_root"];
      for (const t of this.selectors) e.push(t.id);
      return e;
    }
    getPossibleParentSelectorIds() {
      const e = ["_root"];
      for (const t of this.selectors) t.canHaveChildSelectors() && e.push(t.id);
      return e;
    }
    getStartUrls() {
      let e;
      return e = Array.isArray(this.startUrl) ? this.startUrl : [this.startUrl], l.Url.parseStartUrlList(e);
    }
    updateSelector(e, t, r = !0) {
      const n = (0, s.selectorFactory)(t, r || e.type !== t.type);
      if (!this.hasSelector(e.id)) return void this.selectors.push(n);
      if (this.hasSelector(n.id) && e.id !== n.id && this.removeSelectorFromSelectorList(n.id),
        n.canHaveChildSelectors()) {
        if (e.id !== n.id)
          for (const t of this.selectors) t.renameParentSelector(e.id, n.id);
      } else this.deleteOccurrencesOfParenting(e.id);
      let i = !1;
      for (const t in this.selectors)
        if (this.selectors[t].id === e.id) {
          this.selectors.splice(t, 1, n), i = !0;
          break;
        }
      if (!i) throw new Error("Couldn't find the selector to replace");
    }
    isOrphanedSelector(e) {
      const t = {},
        r = e => {
          if (void 0 !== t[e]) return;
          t[e] = !0;
          const n = this.getSelectorById(e);
          if (null !== n)
            for (const e of n.parentSelectors) r(e);
        };
      r(e);
      return !(void 0 !== t._root);
    }
    deleteSelector(e) {
      this.removeSingleSelector(e.id);
      const t = [];
      for (const e of this.selectors) this.isOrphanedSelector(e.id) && t.push(e.id);
      for (const e of t) this.removeSingleSelector(e);
    }
    getDataTableId() {
      return this._id.replace(/\./g, "_");
    }
    exportSitemap() {
      const e = JSON.parse(JSON.stringify(this));
      return JSON.stringify(e);
    }
    importSitemap(e) {
      const t = JSON.parse(e);
      this.initData(t);
    }
    getDataColumns(e = !0) {
      let t = [];
      e && (t = ["web-scraper-order", "web-scraper-start-url"]);
      for (const e of this.selectors) t = t.concat(e.getDataColumns());
      return t;
    }
    getImageDataColumns() {
      let e = [];
      for (const t of this.selectors) "SelectorImage" === t.type && (e = e.concat(t.getDataColumns()));
      return e;
    }
    getDataExportCsvBlob(e) {
      const t = this.getDataColumns();
      return i.CSV.getCsvBlob(e, t);
    }
    getDataExportXlsxBlob(e) {
      return n(this, void 0, void 0, (function*() {
        const t = this.getDataColumns();
        return yield c.Xlsx.getXlsxBlob(e, t);
      }));
    }
    getSelectorById(e) {
      return this.selectors.getSelectorById(e);
    }
    getSelectorsById(e) {
      const t = [];
      for (const r of e) {
        const e = this.selectors.getSelectorById(r);
        e && t.push(e);
      }
      return t;
    }
    hasSelector(e) {
      for (const t of this.selectors)
        if (t.id === e) return !0;
      return !1;
    }
    clone() {
      const e = JSON.parse(JSON.stringify(this));
      return new f(e);
    }
    getDataPreviewSelectors(e, t) {
      var r;
      const n = this.clone(),
        i = [],
        o = e => {
          for (const t of n.selectors) t.hasParentSelector(e) && (i.includes(t) || (i.push(t),
            !t.isLinkSelector() && t.canHaveChildSelectors() && o(t.id)));
        };
      if (t) {
        const e = n.getSelectorById(t);
        i.push(e), e.isLinkSelector() || o(t);
      } else o(null !== (r = e[e.length - 1]) && void 0 !== r ? r : "_root");
      return i;
    }
    getSitemapHash() {
      const e = new Map;
      if (this.websiteStateSetup)
        for (const t of this.websiteStateSetup.actions)
          if ("passwordInput" === t.type) {
            const r = h.PasswordHash.hashPassword(t.value);
            t.valueHashed = r, e.set(r, t.value), delete t.value;
          }
      const t = a.Obj.recursiveKeySort(this).toString(),
        r = d.Str.getHash(t);
      if (this.websiteStateSetup)
        for (const t of this.websiteStateSetup.actions) "passwordInput" === t.type && (t.value = e.get(t.valueHashed),
          delete t.valueHashed);
      return r;
    }
    setHashHistory(e = !1) {
      const t = this.getSitemapHash();
      if (this.hashHistory) {
        const r = this.hashHistory.slice(-1)[0];
        e ? this.hashHistory[this.hashHistory.length - 1] = t : r !== t && this.hashHistory.push(t),
          this.hashHistory.length >= 100 && (this.hashHistory = this.hashHistory.slice(-100));
      } else this.hashHistory = [t];
    }
    deduplicateLastHashes() {
      return this.hashHistory[this.hashHistory.length - 1] !== this.hashHistory[this.hashHistory.length - 2] || (this.hashHistory.pop(),
        !1);
    }
    getFirstStartUrlDomain() {
      return l.Url.getDomain(Array.isArray(this.startUrl) ? this.startUrl[0] : this.startUrl);
    }
    hasAuth() {
      if (this.websiteStateSetup && this.websiteStateSetup.enabled)
        for (const e of this.websiteStateSetup.actions)
          if ("input" === e.type || "passwordInput" === e.type) return !0;
      return !1;
    }
    getCssSelectors(e) {
      return u.SitemapSelectorCssStringBuilder.getCssSelectors(e, this);
    }
    optimizeSelectorsForPerformance() {
      for (const e of this.selectors) e.optimizeCSSSelectors();
    }
    changeSelectorOrder(e, t) {
      const [r] = this.selectors.splice(e, 1);
      this.selectors.splice(t, 0, r);
    }
    isUnusedSelectorId(e) {
      for (const t of this.selectors)
        if (t.id === e) return !1;
      return !0;
    }
    removeSingleSelector(e) {
      this.removeSelectorFromSelectorList(e), this.deleteOccurrencesOfParenting(e);
    }
    deleteDefaultExperimentalAttributes(e) {
      for (const [t, r] of Object.entries(e.selectors)) {
        const n = (0, s.selectorFactory)(r),
          i = n.getExperimentalFeatures();
        if (i.length > 0) {
          const r = (0, s.selectorFactory)({
            type: n.type
          });
          for (const o of i) n[o] === r[o] && delete e.selectors[t][o];
        }
      }
      return e;
    }
    deleteOccurrencesOfParenting(e) {
      for (const t of this.selectors) t.hasParentSelector(e) && (t.removeParentSelector(e),
        0 === t.parentSelectors.length && this.deleteSelector(t));
    }
    removeSelectorFromSelectorList(e) {
      for (const t in this.selectors)
        if (this.selectors[t].id === e) {
          this.selectors.splice(t, 1);
          break;
        }
    }
  }
  t.Sitemap = f;
},