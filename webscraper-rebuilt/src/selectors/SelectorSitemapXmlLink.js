/**
 * Module: SelectorSitemapXmlLink
 * Source module ID: 97956
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

97956: function(e, t, r) {
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
    i = this && this.__await || function(e) {
      return this instanceof i ? (this.v = e, this) : new i(e);
    },
    o = this && this.__asyncValues || function(e) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var t, r = e[Symbol.asyncIterator];
      return r ? r.call(e) : (e = "function" == typeof __values ? __values(e) : e[Symbol.iterator](),
        t = {}, n("next"), n("throw"), n("return"), t[Symbol.asyncIterator] = function() {
          return this;
        }, t);

      function n(r) {
        t[r] = e[r] && function(t) {
          return new Promise((function(n, i) {
            (function(e, t, r, n) {
              Promise.resolve(n).then((function(t) {
                e({
                  value: t,
                  done: r
                });
              }), t);
            })(n, i, (t = e[r](t)).done, t.value);
          }));
        };
      }
    },
    s = this && this.__asyncDelegator || function(e) {
      var t, r;
      return t = {}, n("next"), n("throw", (function(e) {
        throw e;
      })), n("return"), t[Symbol.iterator] = function() {
        return this;
      }, t;

      function n(n, o) {
        t[n] = e[n] ? function(t) {
          return (r = !r) ? {
            value: i(e[n](t)),
            done: !1
          } : o ? o(t) : t;
        } : o;
      }
    },
    a = this && this.__asyncGenerator || function(e, t, r) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var n, o = r.apply(e, t || []),
        s = [];
      return n = Object.create(("function" == typeof AsyncIterator ? AsyncIterator : Object).prototype),
        a("next"), a("throw"), a("return", (function(e) {
          return function(t) {
            return Promise.resolve(t).then(e, u);
          };
        })), n[Symbol.asyncIterator] = function() {
          return this;
        }, n;

      function a(e, t) {
        o[e] && (n[e] = function(t) {
          return new Promise((function(r, n) {
            s.push([e, t, r, n]) > 1 || l(e, t);
          }));
        }, t && (n[e] = t(n[e])));
      }

      function l(e, t) {
        try {
          (r = o[e](t)).value instanceof i ? Promise.resolve(r.value.v).then(c, u) : d(s[0][2], r);
        } catch (e) {
          d(s[0][3], e);
        }
        var r;
      }

      function c(e) {
        l("next", e);
      }

      function u(e) {
        l("throw", e);
      }

      function d(e, t) {
        e(t), s.shift(), s.length && l(s[0][0], s[0][1]);
      }
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorSitemapXmlLink = void 0;
  const l = r(789),
    c = r(74161),
    u = r(90711),
    d = r(24567),
    h = r(90195);
  class f extends u.Selector {
    constructor(e, t = !1) {
      super(), this.type = "SelectorSitemapXmlLink", this.sitemapXmlMinimumPriority = .1,
        this.sitemapXmlUrlRegex = "", this.sitemapXmlUrls = [""], this.version = void 0,
        t && (e.version = 2), this.updateData(e);
    }
    get urlRegexp() {
      try {
        return new RegExp(this.sitemapXmlUrlRegex);
      } catch (e) {
        return new RegExp("");
      }
    }
    canReturnMultipleRecords() {
      return !0;
    }
    canHaveChildSelectors() {
      return !0;
    }
    canCreateNewJobs() {
      return !0;
    }
    willReturnElements() {
      return !1;
    }
    willReturnMultipleRecords() {
      return !0;
    }
    getSitemapXmlUrls() {
      return n(this, void 0, void 0, (function*() {
        return this.sitemapXmlUrls;
      }));
    }
    extractDataFromSitemapXmlContents(e) {
      const t = /<url[^>]*?>([\s\S]+?)<\/url>/g,
        r = /<loc[^>]*?>[\s\n]*(.+?)[\s\n]*<\/loc>/,
        n = /<priority[^>]*?>(.+?)<\/priority>/,
        i = [],
        o = this.urlRegexp;
      for (;;) {
        const s = t.exec(e);
        if (!s) break;
        const a = s[1],
          c = a.match(r);
        if (!c) continue;
        let u = l.Str.removeCDATA(c[1]);
        if (u = l.Str.removeRef(u), u = l.Str.decodeHTMLEntities(u), !u.match(o)) continue;
        const d = a.match(n);
        if (d) {
          if (Number(l.Str.removeCDATA(d[1])) < this.sitemapXmlMinimumPriority) continue;
        }
        const h = {
          _followSelectorId: this.id,
          _follow: u
        };
        h[this.getColumnId()] = u, i.push(h);
      }
      return i;
    }
    extractSitemapXmlUrlsFromSitemapXmlContents(e) {
      const t = /<sitemap>([\s\S]+?)<\/sitemap>/g,
        r = /<loc>[\s\n]*(.+?)[\s\n]*<\/loc>/,
        n = [];
      for (;;) {
        const i = t.exec(e);
        if (!i) break;
        const o = i[1].match(r);
        if (!o) continue;
        let s = l.Str.removeCDATA(o[1]);
        s = l.Str.decodeHTMLEntities(s), n.push(s);
      }
      return n;
    }
    _getData(e) {
      return a(this, arguments, (function*() {
        const t = yield i(this.getSitemapXmlUrls()), r = [];
        for (const n of t) yield i(yield* s(o(yield i(this.extractUrlsFromSitemapXml(e, n, r)))));
      }));
    }
    getDataColumns() {
      return [this.getColumnId()];
    }
    getFeatures() {
      return ["sitemapXmlUrls", "sitemapXmlUrlRegex", "sitemapXmlMinimumPriority", "dataPreviewButton"];
    }
    getHiddenFeatures() {
      return ["version"];
    }
    isLinkSelector() {
      return !0;
    }
    sitemapXmlUrlsValidationData(e) {
      const t = {};
      for (let r = 0; r < e.length; r++) t[`sitemapXmlUrls[${r}]`] = e[r];
      return t;
    }
    getValidationData() {
      const e = d.Obj.clone(this),
        t = this.sitemapXmlUrlsValidationData(e.sitemapXmlUrls);
      return delete e.sitemapXmlUrls, Object.assign(Object.assign({}, e), t);
    }
    getColumnId() {
      return this.version && 1 !== this.version ? this.id : `${this.id}-href`;
    }
    getSelectorsForOptimization() {
      return [];
    }
    extractUrlsFromSitemapXml(e, t, r) {
      return a(this, arguments, (function*() {
        if (r.includes(t)) return yield i({});
        r.push(t), c.Log.info("Downloading sitemap.xml", {
          url: t
        });
        try {
          const n = yield i(e.downloadUrl(t)), a = this.extractDataFromSitemapXmlContents(n);
          for (const e of a) yield yield i(e);
          const l = this.extractSitemapXmlUrlsFromSitemapXmlContents(n);
          for (let n of l) n = h.Url.combine(t, n), yield i(yield* s(o(yield i(this.extractUrlsFromSitemapXml(e, n, r)))));
        } catch (e) {
          c.Log.notice("failed to download sitemap.xml", {
            error: e.toString(),
            url: t
          });
        }
      }));
    }
  }
  t.SelectorSitemapXmlLink = f;
},