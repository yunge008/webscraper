/**
 * Module: DataExtractor
 * Source module ID: 52507
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

52507: function(e, t, r) {
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
    },
    i = this && this.__asyncValues || function(e) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var t, r = e[Symbol.asyncIterator];
      return r ? r.call(e) : (e = "function" == typeof __values ? __values(e) : e[Symbol.iterator](),
        t = {}, n("next"), n("throw"), n("return"), t[Symbol.asyncIterator] = function() {
          return this;
        }, t);

      function n(r) {
        t[r] = e[r] && function(t) {
          return new Promise((function(n, i) {
            (function(e, t, r, n) {
              Promise.resolve(n).then((function(t) {
                e({
                  value: t,
                  done: r
                });
              }), t);
            })(n, i, (t = e[r](t)).done, t.value);
          }));
        };
      }
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.DataExtractor = void 0;
  const o = r(45431),
    s = r(49030),
    a = r(24567),
    l = r(67849),
    c = r(70259),
    u = r(66188),
    d = r(18211),
    h = r(17747);
  t.DataExtractor = class {
    constructor(e, t, r, n = {}) {
      this.rawDataSize = 0, this.deduplicators = new Map, this.defaultOptions = {
          deduplicateFirstPageData: void 0,
          dataExtractorTimeout: 9 * c.TIME.ONE_MINUTE_MS,
          extractedDataSizeLimit: 25 * u.MEMORY_SIZE.ONE_MB_BYTES
        }, r instanceof o.Sitemap ? this.sitemap = r : this.sitemap = new o.Sitemap(r),
        this.parentSelectorId = t, this.parentElement = e, n = Object.assign(Object.assign({}, this.defaultOptions), n),
        this.deduplicateFirstPageData = n.deduplicateFirstPageData, this.timeout = n.dataExtractorTimeout,
        this.sizeLimit = n.extractedDataSizeLimit, this.extractionTimeout = new l.TimeoutCounter(this.timeout);
    }
    getData() {
      return n(this, void 0, void 0, (function*() {
        const e = this.sitemap.getSelectorById(this.parentSelectorId);
        let t, r;
        return e && (t = this.getDeduplicator(e)), r = "SelectorPagination" === (null == e ? void 0 : e.type) ? yield this.getSelectorData(this.parentSelectorId, e, this.parentElement): yield this.getChildSelectorData(this.parentSelectorId, this.parentElement, !0),
          t && t instanceof h.SelectorPaginationDataDeduplicator && (r = t.deduplicateFirstPageData(r)),
          r;
      }));
    }
    getChildSelectorData(e, t) {
      return n(this, arguments, void 0, (function*(e, t, r = !1) {
        const n = this.sitemap.getDirectChildSelectors(e);
        let i = {},
          o = !1,
          s = [];
        for (const a of n) {
          if (a.id === e && !r) continue;
          const n = yield this.getSelectorData(e, a, t);
          this.selectorWillReturnMultipleRecords(a) ? s = s.concat(n) : (i = Object.assign(Object.assign({}, i), n[0]),
            o = !0);
        }
        if (this.checkJoinedDataSize(i, s), 0 === s.length) return o ? [i] : [];
        {
          const e = [];
          for (const t of s) e.push(Object.assign(Object.assign({}, i), t));
          return e;
        }
      }));
    }
    getSelectorData(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        var n, o, s, a;
        const l = [],
          c = this.getDeduplicator(t);
        try {
          for (var u, f = !0, p = i(t.getData(r, c, this.sitemap)); !(n = (u = yield p.next()).done); f = !0) {
            a = u.value, f = !1;
            const r = a;
            if (this.isTimeoutReached(), c.startNewDataBatch(), r instanceof d.WebPageChromeTabElement) {
              let n = yield this.getChildSelectorData(t.id, r, !1);
              c instanceof h.SelectorPaginationDataDeduplicator && e !== t.id && c.setFirstPageDeduplicationDataHash(n),
                t.shouldDiscardEmptyValues() && (n = this.discardEmptyValues(n)), n = c.deduplicateData(n),
                l.push(...n);
            } else this.checkRawDataSize(r), l.push(r);
          }
        } catch (e) {
          o = {
            error: e
          };
        } finally {
          try {
            f || n || !(s = p.return) || (yield s.call(p));
          } finally {
            if (o) throw o.error;
          }
        }
        if (c instanceof h.SelectorPaginationDataDeduplicator)
          for (const e of l)
            if (e._followSelectorId === t.id) {
              const t = c.getFirstPageDeduplicationHash();
              e._deduplicateFirstPageData = t;
            }
        return l;
      }));
    }
    selectorWillReturnMultipleRecords(e) {
      if (e.willReturnMultipleRecords()) return !0;
      const t = this.sitemap.getDirectChildSelectors(e.id);
      for (const r of t) {
        if (r.willReturnMultipleRecords()) return !0;
        if (e.id !== r.id && r.willReturnElements() && this.selectorWillReturnMultipleRecords(r)) return !0;
      }
      return !1;
    }
    discardEmptyValues(e) {
      const t = [];
      for (const r of e)
        for (const e in r)
          if (void 0 !== r[e]) {
            t.push(r);
            break;
          }
      return t;
    }
    checkRawDataSize(e) {
      const t = a.Obj.getSize(e);
      if (this.rawDataSize += t, this.rawDataSize > this.sizeLimit) throw new s.DataSizeLimitError("Extracted data size limit exceeded", this.rawDataSize / u.MEMORY_SIZE.ONE_MB_BYTES);
    }
    checkJoinedDataSize(e, t) {
      const r = a.Obj.getSize(e);
      let n = 0;
      for (const e of t) n += r + a.Obj.getSize(e);
      if (n > this.sizeLimit) throw new s.DataSizeLimitError("Extracted data size limit exceeded", n / u.MEMORY_SIZE.ONE_MB_BYTES);
    }
    isTimeoutReached() {
      if (this.extractionTimeout.isTimedOut()) throw new Error("Data extractor timeout reached");
    }
    getDeduplicator(e) {
      return this.deduplicators.has(e.id) || this.deduplicators.set(e.id, e.getDeduplicator(this.deduplicateFirstPageData)),
        this.deduplicators.get(e.id);
    }
  };
},