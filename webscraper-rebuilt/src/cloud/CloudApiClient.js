/**
 * Module: CloudApiClient
 * Source module ID: 44852
 * Category: cloud
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

44852: function(e, t, r) {
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
  }), t.CloudApiClient = void 0;
  const i = r(81801),
    o = r(28760);
  class s extends i.BaseExtensionApiClient {
    static getApiToken() {
      return n(this, void 0, void 0, (function*() {
        return o.CloudAuthenticationService.getApiToken();
      }));
    }
  }
  t.CloudApiClient = s, s.baseUrl = "";
},
