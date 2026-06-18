/**
 * Module: DataPreviewReporter
 * Source module ID: 93987
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

93987: function(e, t, r) {
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
  }), t.DataPreviewReporter = void 0;
  const i = r(54886),
    o = r(59944);
  t.DataPreviewReporter = class {
    static postDataPreview(e, t, r, s, a, l) {
      return n(this, void 0, void 0, (function*() {
        const n = JSON.stringify(r),
          c = {
            url: e,
            html: t,
            selectors: n,
            parentSelector: s,
            interceptedRequests: a,
            wrapperHTML: l
          };
        yield i.HttpRequest.post(`${o.API_BASE_URL}/taggedData`, c);
      }));
    }
  };
},