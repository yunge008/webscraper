/**
 * Module: SitemapDataRepository
 * Source module ID: 75736
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

75736: function(e, t, r) {
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
  }), t.SitemapDataRepository = void 0;
  const i = r(6134),
    o = r(69536),
    s = r(78202),
    a = r(39153),
    l = r(74161);
  class c extends i.BaseRepository {
    constructor(e) {
      const t = o.SitemapDataTransformer.buildDbName(e);
      super({
        dbName: t,
        storageName: t
      }), this.sitemapId = e;
    }
    getCount() {
      return n(this, void 0, void 0, (function*() {
        return this.database.getCount();
      }));
    }
    getAll() {
      const e = Object.create(null, {
        getAll: {
          get: () => super.getAll
        }
      });
      return n(this, void 0, void 0, (function*() {
        let t = yield e.getAll.call(this);
        if (0 === t.length) try {
          yield this.migrateDataFromLegacyStorage(this.sitemapId), t = yield e.getAll.call(this);
        } catch (e) {
          l.Log.notice("Failed to migrate data from legacy storage", {
            error: a.Err.getMessage(e)
          });
        }
        return t.sort(((e, t) => {
          const r = e["web-scraper-order"],
            n = t["web-scraper-order"],
            i = parseInt(r.substr(0, 10), 10),
            o = parseInt(n.substr(0, 10), 10);
          if (i === o) {
            const e = parseInt(r.substring(11), 10),
              t = parseInt(n.substring(11), 10);
            return e === t ? 0 : e > t ? 1 : -1;
          }
          return i > o ? 1 : -1;
        }));
      }));
    }
    migrateDataFromLegacyStorage(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield new Promise(((e, t) => {
          const r = indexedDB.open(s.LocalForageDb.defaultStorageName);
          r.onsuccess = t => {
            e(Array.from(t.target.result.objectStoreNames));
          }, r.onerror = e => {
            t(e);
          }, r.onupgradeneeded = e => {
            t(e);
          }, r.onblocked = e => {
            t(e);
          };
        })), r = o.SitemapDataTransformer.buildDbName(e);
        if (!t.includes(r)) return;
        const n = new s.LocalForageDb(r, s.LocalForageDb.defaultStorageName),
          i = yield n.getAll();
        yield this.createMany(i), yield n.destroy();
      }));
    }
  }
  t.SitemapDataRepository = c;
},