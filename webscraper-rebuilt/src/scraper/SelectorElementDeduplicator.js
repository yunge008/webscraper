/**
 * Module: SelectorElementDeduplicator
 * Source module ID: 71187
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

71187: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorElementDeduplicator = void 0;
  const n = r(24567),
    i = r(3038);
  class o extends i.DataDeduplicator {
    constructor() {
      super(...arguments), this._elementsAreBeingModified = !1, this.currentDataBatch = [],
        this.recordHashes = [], this.lastRecordHashes = [], this.lastBatchHash = "";
    }
    deduplicateData(e) {
      this.currentDataBatch.push(...e);
      const t = [];
      for (const r of e) {
        const e = n.Obj.getHash(r),
          i = this.lastRecordHashes.indexOf(e);
        i < 0 ? t.push(r) : this.lastRecordHashes.splice(i, 1);
      }
      return t;
    }
    advanceScroll() {
      let e = [];
      e = this._elementsAreBeingModified || this.shouldDeduplicateNewData() ? this.deduplicateBatch() : this.appendBatch(),
        this._lastBatchIsDuplicate = 0 === e.length, this.currentDataBatch = [], this.lastRecordHashes = [...this.recordHashes];
    }
    elementsAreBeingModified() {
      return this._elementsAreBeingModified;
    }
    getStoredRecordCount() {
      return this.recordHashes.length;
    }
    startNewDataBatch() {}
    shouldDeduplicateNewData() {
      const e = this.getStoredRecordCount();
      return 0 !== e && ((e > this.currentDataBatch.length || this.lastBatchHash !== n.Obj.getHash(this.currentDataBatch.slice(0, e))) && (this._elementsAreBeingModified = !0,
        !0));
    }
    appendBatch() {
      this.lastBatchHash = n.Obj.getHash(this.currentDataBatch);
      const e = this.currentDataBatch.slice(this.getStoredRecordCount());
      for (const t of e) this.recordHashes.push(n.Obj.getHash(t));
      return e;
    }
    deduplicateBatch() {
      const e = new Set(this.recordHashes),
        t = [];
      for (const r of this.currentDataBatch) {
        const i = n.Obj.getHash(r);
        e.has(i) || (t.push(r), e.add(i));
      }
      return this.recordHashes = Array.from(e), t;
    }
  }
  t.SelectorElementDeduplicator = o;
},