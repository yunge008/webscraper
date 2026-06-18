/**
 * Module: LocalForageDb
 * Source module ID: 78202
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

78202: function(e, t, r) {
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
    i = this && this.__importDefault || function(e) {
      return e && e.__esModule ? e : {
        default: e
      };
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.LocalForageDb = void 0;
  const o = i(r(73790));
  class s {
    constructor(e, t) {
      this.memoryDriverName = "localforage-driver-memory", this.db = o.default.createInstance({
        name: t,
        storeName: e,
        driver: this.getDriver()
      });
    }
    create(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.db.setItem(e._id, e);
      }));
    }
    get(e) {
      return n(this, void 0, void 0, (function*() {
        return (yield this.db.getItem(e)) || void 0;
      }));
    }
    update(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.create(e);
      }));
    }
    delete(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.db.removeItem(e);
      }));
    }
    destroy() {
      return n(this, void 0, void 0, (function*() {
        yield this.db.clear();
      }));
    }
    getCount() {
      return n(this, void 0, void 0, (function*() {
        return this.db.length();
      }));
    }
    getAll() {
      return n(this, void 0, void 0, (function*() {
        const e = [];
        return yield this.db.iterate((t => {
          e.push(t);
        })), e;
      }));
    }
    createMany(e) {
      return n(this, void 0, void 0, (function*() {
        for (const t of e) yield this.create(t);
      }));
    }
    exists(e) {
      return n(this, void 0, void 0, (function*() {
        return void 0 !== (yield this.get(e));
      }));
    }
    getDriver() {
      return o.default.supports(this.memoryDriverName) ? this.memoryDriverName : o.default.INDEXEDDB;
    }
  }
  t.LocalForageDb = s, s.defaultStorageName = "WebScraper-localForage";
},