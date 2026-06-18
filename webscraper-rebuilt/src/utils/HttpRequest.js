/**
 * Module: HttpRequest
 * Source module ID: 54886
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

54886: function(e, t, r) {
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
  }), t.HttpRequest = void 0;
  const o = r(39153),
    s = r(74161),
    a = i(r(61160));
  class l {
    static post(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        const n = {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          },
          body: JSON.stringify(t),
          signal: null == r ? void 0 : r.signal
        };
        return l.makeRequest(e, n);
      }));
    }
    static get(e, t) {
      return n(this, void 0, void 0, (function*() {
        const r = {
          signal: null == t ? void 0 : t.signal
        };
        return (null == t ? void 0 : t.withCredentials) && (r.credentials = "include"),
          l.makeRequest(e, r);
      }));
    }
    static delete(e, t) {
      return n(this, void 0, void 0, (function*() {
        const r = {
          method: "DELETE",
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          },
          body: JSON.stringify(null == t ? void 0 : t.body),
          credentials: (null == t ? void 0 : t.withCredentials) ? "include" : "omit",
          signal: null == t ? void 0 : t.signal
        };
        return l.makeRequest(e, r);
      }));
    }
    static makeRequest(e, t) {
      return n(this, void 0, void 0, (function*() {
        var r, n;
        if ("undefined" != typeof chrome && "function" == typeof(null === (r = null === chrome || void 0 === chrome ? void 0 : chrome.runtime) || void 0 === r ? void 0 : r.getManifest)) {
          const e = chrome.runtime.getManifest().version;
          t = Object.assign(Object.assign({}, t), {
            headers: Object.assign(Object.assign({}, t.headers), {
              "X-Web-Scraper-Version": e
            })
          });
        }
        const i = yield fetch(e, t), l = yield i.json();
        if (!i.ok) {
          const r = null !== (n = null == l ? void 0 : l.error) && void 0 !== n ? n : null == l ? void 0 : l.message;
          let i = "Something went wrong.";
          throw "object" == typeof r ? i = Object.values(r).join("||") : r && (i = o.Err.getMessage(r)),
            s.Log.notice("Request failed", {
              error: i,
              requestBody: t.body,
              requestUrl: (0, a.default)(e).pathname
            }), new Error(i);
        }
        return l;
      }));
    }
  }
  t.HttpRequest = l;
},