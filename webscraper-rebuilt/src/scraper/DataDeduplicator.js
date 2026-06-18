/**
 * Module: DataDeduplicator
 * Source module ID: 3038
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

3038: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.DataDeduplicator = void 0;
  t.DataDeduplicator = class {
    constructor() {
      this._lastBatchIsDuplicate = !1;
    }
    startNewDataBatch() {
      this._lastBatchIsDuplicate = !0;
    }
    lastBatchIsDuplicate() {
      return this._lastBatchIsDuplicate;
    }
    deduplicateData(e) {
      return e;
    }
  };
},