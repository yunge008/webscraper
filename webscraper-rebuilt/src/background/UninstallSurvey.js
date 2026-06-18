/**
 * Module: UninstallSurvey
 * Source module ID: 67043
 * Category: background
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

67043: function(e, t, r) {
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
  }), t.UninstallSurvey = void 0;
  const i = r(74161),
    o = r(72328);
  t.UninstallSurvey = class {
    static uninstall(e) {
      return n(this, void 0, void 0, (function*() {
        const t = new o.SitemapRepository,
          r = `https://surveys.webscraper.io/surveys/extension-uninstall?s=${yield t.getCount()}&r=${yield t.getRecordCount()}&t=${e}`;
        chrome.runtime.setUninstallURL(r, (() => {
          const e = chrome.runtime.lastError;
          e && i.Log.error("Couldn't set uninstall url", {
            error: e.toString()
          });
        }));
      }));
    }
  };
},