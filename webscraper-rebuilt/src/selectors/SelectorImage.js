/**
 * Module: SelectorImage
 * Source module ID: 53947
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

53947: function(e, t, r) {
  "use strict";
  var n = this && this.__await || function(e) {
      return this instanceof n ? (this.v = e, this) : new n(e);
    },
    i = this && this.__asyncGenerator || function(e, t, r) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var i, o = r.apply(e, t || []),
        s = [];
      return i = Object.create(("function" == typeof AsyncIterator ? AsyncIterator : Object).prototype),
        a("next"), a("throw"), a("return", (function(e) {
          return function(t) {
            return Promise.resolve(t).then(e, u);
          };
        })), i[Symbol.asyncIterator] = function() {
          return this;
        }, i;

      function a(e, t) {
        o[e] && (i[e] = function(t) {
          return new Promise((function(r, n) {
            s.push([e, t, r, n]) > 1 || l(e, t);
          }));
        }, t && (i[e] = t(i[e])));
      }

      function l(e, t) {
        try {
          (r = o[e](t)).value instanceof n ? Promise.resolve(r.value.v).then(c, u) : d(s[0][2], r);
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
  }), t.SelectorImage = void 0;
  const o = r(90711),
    s = r(90195),
    a = r(74161),
    l = /\s*([^,]\S*[^,](?:\s+[^,]+)?)\s*(?:,|$)/;
  class c extends o.Selector {
    constructor(e, t = !1) {
      super(), this.type = "SelectorImage", this.selector = "", this.multiple = !1, this.version = void 0,
        e.multipleType = e.multipleType || "singleColumn", e.columnCount = "multipleColumns" === e.multipleType ? e.columnCount || 5 : void 0,
        void 0 !== e.columnCount && (e.columnCount = e.columnCount > 0 ? e.columnCount : 1),
        "singleColumn" !== e.multipleType && delete e.multiple, t && (e.version = 2), this.updateData(e);
    }
    static extractSrcset(e, t) {
      const r = new Map,
        n = e.replace(/\r?\n/, "").replace(/,\s+/, ", ").split(l);
      let i = !1,
        o = !1;
      for (const e of n) {
        const [t, ...n] = e.trim().split(/\s+/);
        if (n.length > 1) continue;
        if (!t) continue;
        if (n.length < 1) {
          o = !0, r.set(t, {
            density: 1
          });
          continue;
        }
        const s = n[0],
          a = s[s.length - 1],
          l = Number.parseFloat(s.slice(0, -1));
        switch (a) {
          case "w":
            i = !0, r.set(t, {
              width: l
            });
            break;

          case "x":
            1 === l && (o = !0), r.set(t, {
              density: l
            });
            break;

          case "h":
            break;

          default:
            o = !0, r.set(t, {
              density: 1
            });
        }
      }
      return i || o || !t || r.has(t) || r.set(t, {
        density: 1
      }), r;
    }
    static handleSrcset(e, t) {
      const r = c.extractSrcset(e, t);
      let n = Array.from(r.entries())[0];
      for (const e of r) "width" in n[1] && "width" in e[1] ? e[1].width > n[1].width && (n = e) : "density" in n[1] && "density" in e[1] ? e[1].density > n[1].density && (n = e) : "density" in n[1] && "width" in e[1] && (n = e);
      return n[0];
    }
    canReturnMultipleRecords() {
      return !0;
    }
    canHaveChildSelectors() {
      return !1;
    }
    canCreateNewJobs() {
      return !1;
    }
    willReturnElements() {
      return !1;
    }
    _getData(e) {
      return i(this, arguments, (function*() {
        const t = yield n(e.getElements(this.selector)), r = yield n(e.getPageUrl()), i = [];
        for (const e of t)
          if (this.version && 1 !== this.version) {
            let t;
            const o = yield n(e.getAttr("src")), s = yield n(e.getAttr("srcset"));
            if (t = s && s.trim().length > 0 ? c.handleSrcset(s, o) : o, t) {
              const e = this.formatImageUrl(t, r);
              i.push(e);
            }
          } else {
            let t = yield n(e.getAttr("src"));
            t || (t = yield n(e.getAttr("srcset"))), t && i.push(t);
          }
        if (0 === i.length) return yield n(void 0);
        switch (this.multipleType) {
          case "singleColumn":
            if (this.multiple)
              for (const e of i) yield yield n({
                [this.getColumnId()]: e
              });
            else yield yield n({
              [this.getColumnId()]: i[0]
            });
            break;

          case "singleColumnWithSeparator":
            yield yield n({
              [this.getColumnId()]: i
            });
            break;

          case "multipleColumns":
            const e = {};
            for (let t = 0; t < i.length && t < this.columnCount; t++) e[this.getColumnId(t)] = i[t];
            yield yield n(e);
            break;

          default:
            throw new Error(`Unsupported multipleType: ${this.multipleType}`);
        }
      }));
    }
    getDataColumns() {
      if ("multipleColumns" !== this.multipleType) return [this.getColumnId()];
      {
        const e = [];
        for (let t = 0; t < this.columnCount; t++) e.push(this.getColumnId(t));
        return e;
      }
    }
    getFormatters() {
      return "singleColumnWithSeparator" === this.multipleType ? {
        [this.getColumnId()]: [{
          type: "ArrayJoinFormatter",
          args: {
            separator: "\n"
          }
        }]
      } : super.getFormatters();
    }
    getFeatures() {
      return ["selector", "multipleType"];
    }
    getHiddenFeatures() {
      return ["columnCount", "multiple", "version"];
    }
    getSelectorsForOptimization() {
      return ["selector"];
    }
    getColumnId(e) {
      return this.version && 1 !== this.version ? `${this.id}${void 0 !== e ? `_${e + 1}` : ""}` : `${this.id}${void 0 !== e ? `-${e + 1}` : ""}-src`;
    }
    formatImageUrl(e, t) {
      if (e.startsWith("//")) {
        e = `${new URL(t).protocol}${e}`;
      }
      if (s.Url.canParse(e)) return e;
      try {
        return s.Url.combine(t, e);
      } catch (r) {
        return a.Log.error("Failed to combine image URL", {
          src: e,
          pageUrl: t
        }), e;
      }
    }
  }
  t.SelectorImage = c;
},