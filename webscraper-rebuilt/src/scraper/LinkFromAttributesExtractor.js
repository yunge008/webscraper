/**
 * Module: LinkFromAttributesExtractor
 * Source module ID: 3791
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

3791: function(e, t, r) {
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
  }), t.LinkFromAttributesExtractor = void 0;
  const i = r(90195);
  t.LinkFromAttributesExtractor = class {
    constructor() {
      this.matcher = new RegExp(/^(https?:\/\/|\/)/), this.ignoredElements = ["link", "object", "svg", "use"],
        this.ignoredAttributes = ["action", "alt", "cite", "class", "formaction", "id", "longdesc", "placeholder", "poster", "src", "srcset", "itemtype", "data-src"];
    }
    extract(e, t) {
      if (!this.ignoredElements.includes(e))
        for (const e in t) {
          if (this.ignoredAttributes.includes(e)) continue;
          const r = t[e];
          if (r.match(this.matcher)) return r;
        }
    }
    execute(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield e.getTagName(), r = yield e.getAllAttributes(), n = this.extract(t, r);
        if (n) return i.Url.combine(yield e.getPageUrl(), n);
      }));
    }
  };
},