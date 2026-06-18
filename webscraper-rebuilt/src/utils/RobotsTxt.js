/**
 * Module: RobotsTxt
 * Source module ID: 45333
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

45333: function(e, t, r) {
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
  }), t.RobotsTxt = void 0;
  const i = r(789),
    o = r(90195),
    s = r(74161);
  t.RobotsTxt = class {
    getRobotsTextContent(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield e.getPageUrl(), r = o.Url.combine(t, "/robots.txt");
        try {
          return yield e.downloadUrl(r);
        } catch (e) {
          return s.Log.notice("failed to download robots.txt", {
            error: e.toString(),
            url: r
          }), "";
        }
      }));
    }
    getSitemapXmlLinksFromRobotsTxt(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield this.getRobotsTextContent(e), r = /Sitemap:\s+(https?:\/\/[^\s]+)/g, n = [];
        let o = r.exec(t);
        for (; o;) {
          const e = i.Str.removeCDATA(o[1]);
          n.push(e), o = r.exec(t);
        }
        return n.length, n;
      }));
    }
  };
},