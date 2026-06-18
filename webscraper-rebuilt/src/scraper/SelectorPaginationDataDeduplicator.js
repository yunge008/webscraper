/**
 * Module: SelectorPaginationDataDeduplicator
 * Source module ID: 17747
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

17747: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorPaginationDataDeduplicator = void 0;
  const n = r(24567),
    i = r(3038),
    o = r(74161);
  class s extends i.DataDeduplicator {
    constructor(e) {
      super(), this.pastBatchDataHashes = [], e && (this.firstPageDeduplicationHash = e);
    }
    deduplicateData(e) {
      if (0 === e.length) return e;
      const t = e.map((e => n.Obj.getHash(e)));
      let r = 0;
      for (const e of this.pastBatchDataHashes) {
        if (e.length > t.length) break;
        let n = !0;
        for (let r = 0; r < e.length; r++)
          if (e[r] !== t[r]) {
            n = !1;
            break;
          }
        if (n) {
          r = e.length;
          break;
        }
      }
      const i = e.splice(r);
      return i.length > 0 && (this._lastBatchIsDuplicate = !1), this.pastBatchDataHashes.unshift(t),
        i;
    }
    setFirstPageDeduplicationDataHash(e) {
      e && (this.firstPageDeduplicationHash = this.makeFirstPageDeduplicationHash(e));
    }
    getFirstPageDeduplicationHash() {
      return void 0 === this.firstPageDeduplicationHash && o.Log.warning("missing first page deduplication hash"),
        this.firstPageDeduplicationHash;
    }
    deduplicateFirstPageData(e) {
      const t = this.makeFirstPageDeduplicationHash(e);
      return this.firstPageDeduplicationHash !== t ? e : e.filter((e => void 0 !== e._deduplicateFirstPageData));
    }
    makeFirstPageDeduplicationHash(e) {
      e = (e = JSON.parse(JSON.stringify(e))).filter((e => void 0 === e._deduplicateFirstPageData));
      return n.Obj.getHash(e);
    }
  }
  t.SelectorPaginationDataDeduplicator = s;
},