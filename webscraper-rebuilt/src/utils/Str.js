/**
 * Module: Str
 * Source module ID: 789
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

789: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Str = void 0;
  const i = n(r(63009)),
    o = n(r(45471));
  class s {
    static slugify(e) {
      return e.toString().toLowerCase().replace(/\s+/g, "-").replace(/\./g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
    }
    static removeCDATA(e) {
      return e.startsWith("<![CDATA[") && e.endsWith("]]>") && (e = e.substr(9, e.length - 12)),
        e;
    }
    static getSize(e, t = "utf-8") {
      return "undefined" != typeof Buffer ? Buffer.byteLength(e, t) : new Blob([e]).size;
    }
    static splitCamelCase(e) {
      return e.replace(/([a-zA-Z])(?=[A-Z])/g, "$1 ");
    }
    static formatValidationFieldName(e) {
      e = (e = (e = e.replace(/\[\d*]|_|\.\*/g, "")).replace(/([\[\]]+)/g, " ")).trim(),
        e = s.splitCamelCase(e);
      const t = s.formValidationFieldNames[e];
      return t && (e = t), e;
    }
    static formatNewValidationFieldName(e, t = !1) {
      return e = this.extractKeyFromPath(e), e = (e = this.formatValidationFieldName(e)).toLowerCase(),
        t && (e = s.capitalizeFirstLetter(e)), e;
    }
    static capitalizeFirstLetter(e) {
      return e.charAt(0).toUpperCase() + e.slice(1);
    }
    static generateRandomStringOfLength(e) {
      const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let r = "";
      for (let n = 0; n < e; n++) r += t.charAt(Math.floor(62 * Math.random()));
      return r;
    }
    static truncate(e, t) {
      if (t < 3) throw new Error("Maximum length must be at least 3");
      return e.length > t && (e = e.substring(0, t - 3).concat("...")), e;
    }
    static isJSON(e) {
      try {
        JSON.parse(e);
      } catch (e) {
        return !1;
      }
      return !0;
    }
    static pathToArr(e) {
      const t = e.split("[").map((e => e.replace("]", "")));
      return t[0] || t.splice(0, 1), t;
    }
    static getHash(e, t = "sha256") {
      let r;
      return r = "sha1" === t ? (0, o.default)(e).toString() : (0, i.default)(e).toString(),
        r;
    }
    static isNumeric(e) {
      return !isNaN(parseInt(e, 10));
    }
    static isValidUTF8(e) {
      const t = new Uint8Array(e),
        r = new TextDecoder("utf-8", {
          fatal: !0
        });
      try {
        return r.decode(t), !0;
      } catch (e) {
        return !1;
      }
    }
    static removeRef(e) {
      return ` ${e}`.substring(1);
    }
    static isEmpty(e) {
      return "" === e || null == e || e.length <= 0;
    }
    static toHex(e) {
      const t = (new TextEncoder).encode(e);
      return Array.from(t, (e => e.toString(16).padStart(2, "0"))).join("");
    }
    static fromHex(e) {
      const t = new Uint8Array(e.length / 2);
      for (let r = 0; r !== t.length; r++) t[r] = parseInt(e.substr(2 * r, 2), 16);
      return (new TextDecoder).decode(t);
    }
    static serialize(e) {
      return s.toHex(JSON.stringify(e));
    }
    static deserialize(e) {
      return JSON.parse(s.fromHex(e));
    }
    static decodeHTMLEntities(e) {
      const t = {
        amp: "&",
        apos: "'",
        lt: "<",
        gt: ">",
        nbsp: " ",
        quot: '"'
      };
      return e.replace(/&([^;]+);/gm, ((e, r) => {
        if ((r = r.toLowerCase()) in t) return t[r];
        const n = r.match(/^#x([\da-fA-F]+)$/);
        if (n && n[1]) return String.fromCharCode(parseInt(n[1], 16));
        const i = r.match(/^#(\d+)$/);
        return i && i[1] ? String.fromCharCode(i[1]) : e;
      }));
    }
    static equal(e, t) {
      return null == e && null == t || e === t;
    }
    static extractKeyFromPath(e) {
      const t = e.split(".");
      if (t.length > 1) {
        const e = t[t.length - 1],
          r = t[0].match(/\[(.*?)]/);
        if (r) {
          return `${e} ${parseInt(r[1], 10) + 1}`;
        }
        return e;
      }
      return e;
    }
  }
  t.Str = s, s.formValidationFieldNames = {
    "columns name": "column name",
    "sitemap Xml Urls": "sitemap.xml url",
    "sitemap Xml Minimum Priority": "sitemap.xml minimum priority",
    "sitemap J S O N": "sitemap JSON",
    selectors: "selector",
    "start Urls": "start url",
    "actions url": "url",
    "actions selector": "selector",
    "actions value": "value",
    "actions duration": "duration"
  };
},