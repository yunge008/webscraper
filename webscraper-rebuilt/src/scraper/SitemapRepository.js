/**
 * Module: SitemapRepository
 * Source module ID: 72328
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

72328: function(e, t, r) {
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
  }), t.SitemapRepository = void 0;
  const i = r(75736),
    o = r(6134),
    s = r(97152),
    a = r(78202);
  class l extends o.BaseRepository {
    constructor() {
      super({
        dbName: l.dbName,
        storageName: a.LocalForageDb.defaultStorageName
      });
    }
    create(e) {
      return n(this, void 0, void 0, (function*() {
        const t = JSON.parse(JSON.stringify(e));
        yield this.database.create(t);
      }));
    }
    delete(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.database.delete(e);
        const t = new i.SitemapDataRepository(e);
        yield t.destroy();
      }));
    }
    getAll() {
      return n(this, void 0, void 0, (function*() {
        const e = yield this.database.getAll();
        return s.SitemapTransformer.toSitemapArray(e);
      }));
    }
    getAllMetadata() {
      return n(this, void 0, void 0, (function*() {
        const e = yield this.database.getAll();
        return s.SitemapTransformer.toSitemapMetadataArray(e);
      }));
    }
    getRecordCount() {
      return n(this, void 0, void 0, (function*() {
        let e = 0;
        const t = yield this.database.getAll();
        for (const r of t) {
          const t = new i.SitemapDataRepository(r._id);
          e += (yield t.getCount());
        }
        return e;
      }));
    }
  }
  t.SitemapRepository = l, l.dbName = "scraper-sitemaps";
},