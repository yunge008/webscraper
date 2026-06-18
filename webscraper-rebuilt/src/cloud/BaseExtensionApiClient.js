/**
 * Module: BaseExtensionApiClient
 * Source module ID: 81801
 * Category: cloud
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

81801: function(e, t, r) {
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
  }), t.BaseExtensionApiClient = void 0;
  const i = r(54886),
    o = r(39153),
    s = r(74161);
  class a {
    static fetchSitemaps() {
      return n(this, void 0, void 0, (function*() {
        const e = yield this.callCloud("get-all");
        for (const t of e) t.localStorage = !1;
        return e;
      }));
    }
    static fetchSitemap(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield this.callCloud(`get/${e}`);
        return JSON.parse(t.sitemap);
      }));
    }
    static pushSitemap(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.callCloud("push", {
          sitemaps: [e]
        });
      }));
    }
    static getApiToken() {
      return n(this, void 0, void 0, (function*() {
        return "";
      }));
    }
    static callCloud(e) {
      return n(this, arguments, void 0, (function*(e, t = {}) {
        const r = yield this.getApiToken();
        if (!r) return void s.Log.warning("No extension API token found");
        const n = new URL(`${this.baseUrl}/extension-api/v1/sitemaps/${e}`);
        n.search = new URLSearchParams({
          extension_api_token: r
        }).toString();
        try {
          const e = yield i.HttpRequest.post(n.toString(), t);
          return e && e.data ? e.data : void 0;
        } catch (e) {
          const t = o.Err.getMessage(e);
          throw new Error(t);
        }
      }));
    }
  }
  t.BaseExtensionApiClient = a, a.baseUrl = "";
},