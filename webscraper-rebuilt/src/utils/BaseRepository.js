/**
 * Module: BaseRepository
 * Source module ID: 6134
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

6134: function(e, t, r) {
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
  }), t.BaseRepository = void 0;
  const i = r(78202);
  t.BaseRepository = class {
    constructor(e) {
      this.database = new i.LocalForageDb(e.dbName, e.storageName);
    }
    create(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.database.create(e);
      }));
    }
    get(e) {
      return n(this, void 0, void 0, (function*() {
        return this.database.get(e);
      }));
    }
    update(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.database.update(e);
      }));
    }
    delete(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.database.delete(e);
      }));
    }
    destroy() {
      return n(this, void 0, void 0, (function*() {
        yield this.database.destroy();
      }));
    }
    createMany(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.database.createMany(e);
      }));
    }
    getAll() {
      return n(this, void 0, void 0, (function*() {
        return this.database.getAll();
      }));
    }
    getCount() {
      return n(this, void 0, void 0, (function*() {
        return this.database.getCount();
      }));
    }
    exists(e) {
      return n(this, void 0, void 0, (function*() {
        return this.database.exists(e);
      }));
    }
  };
},