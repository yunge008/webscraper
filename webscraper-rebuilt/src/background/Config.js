/**
 * Module: Config
 * Source module ID: 90042
 * Category: background
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

90042: function(e, t, r) {
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
  }), t.Config = void 0;
  const i = r(36385),
    o = r(87594);
  class s {
    static get(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield i.ChromeStorageLocal.get(e);
        return void 0 === t ? s._defaults[e] : t;
      }));
    }
    static set(e, t) {
      return n(this, void 0, void 0, (function*() {
        yield i.ChromeStorageLocal.set(e, t);
      }));
    }
    static isDailyStatsEnabled() {
      return n(this, void 0, void 0, (function*() {
        if (o.Browser.isFirefox()) {
          const e = yield browser.permissions.getAll();
          return !(!e.data_collection || !e.data_collection.includes("technicalAndInteraction"));
        }
        return s.get("enableDailyStats");
      }));
    }
  }
  t.Config = s, s._defaults = {
    enableDailyStats: !0,
    experimentalFeaturesEnabled: !1
  };
},