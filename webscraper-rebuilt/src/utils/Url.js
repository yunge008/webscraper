/**
 * Module: Url
 * Source module ID: 90195
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

90195: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Url = void 0;
  const i = n(r(61160));
  class o {
    static combine(e, t) {
      return new URL(t, e).toString();
    }
    static isValidUrlOrUrlPart(e) {
      try {
        return o.combine("http://example.com/", e), !0;
      } catch (e) {
        return !1;
      }
    }
    static escapeWhiteSpace(e) {
      return null == e ? e : e = (e = (e = (e = (e = (e = e.trim()).replace(/ /g, "%20")).replace(/\xa0/g, "%C2%A0")).replace(/\n/g, "%0A")).replace(/\r/g, "%0D")).replace(/\t/g, "%09");
    }
    static isExtensionUrl(e) {
      return !!e && e.startsWith("chrome-extension://");
    }
    static isHashTagChange(e, t) {
      if (!e || !t) return !1;
      const r = e.match(/^[^#]+#/),
        n = t.match(/^[^#]+#/);
      if (r && n) {
        const e = r[0];
        if (n[0] === e) return !0;
      } else if (n) {
        if (n[0] === `${e}#`) return !0;
      }
      return !1;
    }
    static getDomain(e) {
      let t = (0, i.default)(e).hostname;
      return t.startsWith("www.") && (t = t.substr(4)), t;
    }
    static getTopLevelDomain(e) {
      const t = (0, i.default)(e).hostname.split(".");
      return t.slice(t.length - 2).join(".");
    }
    static isRecognizedProtocol(e) {
      const t = (0, i.default)(e);
      return e && (!t.protocol || "http:" === t.protocol || "https:" === t.protocol);
    }
    static fixStartUrls(e) {
      "string" == typeof e && (e = [e]);
      const t = [];
      for (const r of e) t.push(r.replace(/[^\x00-\x7F]/g, (e => {
        try {
          return encodeURIComponent(e);
        } catch (t) {
          return e;
        }
      })));
      return t;
    }
    static getParameterByName(e, t) {
      const r = (0, i.default)(e);
      r.query;
      const n = r.query.split(/[?&#]/);
      for (const e of n) {
        const r = e.match(/^([^=]+)=?(.*)$/);
        if (r && r[1] === t) return r[2] ? decodeURIComponent(r[2]) : "";
      }
      return "";
    }
    static parseStartUrlList(e) {
      const t = [];
      for (const r of e) {
        const e = (e, t) => {
            for (; e.length < t;) e = `0${e}`;
            return e;
          },
          n = /^(.*?)\[(\d+)\-(\d+)(:(\d+))?\](.*)$/,
          i = r.match(n);
        if (i) {
          const r = i[2],
            n = i[3],
            o = parseInt(r, 10),
            s = parseInt(n, 10);
          let a = 1;
          void 0 !== i[5] && (a = parseInt(i[5], 10));
          for (let l = o; l <= s; l += a) r.length === n.length ? t.push(i[1] + e(l.toString(), r.length) + i[6]) : t.push(i[1] + l + i[6]);
        } else t.push(r);
      }
      return t;
    }
    static makeStartUrlObjectList(e) {
      const t = [];
      for (const r of e) t.push({
        startUrl: r
      });
      return t;
    }
    static stripProtocolAndQuery(e) {
      const t = (0, i.default)(e);
      return `${t.hostname}${t.pathname}`;
    }
    static getImageExtension(e) {
      var t;
      const r = e.match(/^.+?\.(.{3,4})($|\?.+|#.+)/);
      return null !== (t = r && r[1]) && void 0 !== t ? t : void 0;
    }
    static getQueryParameters(e) {
      const t = new URLSearchParams(new URL(e, "http://baseurl/").search),
        r = {};
      for (const [e, n] of t.entries()) r[e] = n;
      return r;
    }
    static isDataUrl(e) {
      return "data:" === new URL(e).protocol;
    }
    static canParse(e) {
      return URL.canParse(e);
    }
    static isLocalHostUrl(e) {
      const t = o.getHost(e);
      return "localhost" === t || "127.0.0.1" === t;
    }
    static getHost(e) {
      return new URL(e).host.replace(/:\d+$/, "");
    }
  }
  t.Url = o;
},