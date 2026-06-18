/**
 * Module: FirstTimeInstall
 * Source module ID: 40850
 * Category: background
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

40850: function(e, t, r) {
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
  }), t.FirstTimeInstall = void 0;
  const i = r(25450),
    o = r(72328),
    s = r(66100),
    a = r(74161);
  class l {
    static init() {
      chrome.runtime.onInstalled.addListener(l.handleInstall);
    }
    static handleInstall({
      reason: e
    }) {
      "install" === e && "browser-automation" !== navigator.userAgent && l.initIndexedDb();
    }
    static initIndexedDb() {
      return n(this, void 0, void 0, (function*() {
        a.Log.info("Initializing indexed db"), yield(new o.SitemapRepository).getAll(),
          yield(new s.StatsRepository).getAll();
      }));
    }
  }
  t.FirstTimeInstall = l, l.TARGET = "https://www.webscraper.io/web-scraper-first-time-install";
},
