/**
 * Module: JsonParser
 * Source module ID: 73992
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

73992: (e, t) => {
    "use strict";
    var r = Object.prototype.hasOwnProperty;

    function n(e) {
      try {
        return decodeURIComponent(e.replace(/\+/g, " "));
      } catch (e) {
        return null;
      }
    }

    function i(e) {
      try {
        return encodeURIComponent(e);
      } catch (e) {
        return null;
      }
    }
    t.stringify = function(e, t) {
      t = t || "";
      var n, o, s = [];
      for (o in "string" != typeof t && (t = "?"), e)
        if (r.call(e, o)) {
          if ((n = e[o]) || null != n && !isNaN(n) || (n = ""), o = i(o), n = i(n), null === o || null === n) continue;
          s.push(o + "=" + n);
        }
      return s.length ? t + s.join("&") : "";
    }, t.parse = function(e) {
      for (var t, r = /([^=?#&]+)=?([^&]*)/g, i = {}; t = r.exec(e);) {
        var o = n(t[1]),
          s = n(t[2]);
        null === o || null === s || o in i || (i[o] = s);
      }
      return i;
    };
  },
  92063: e => {
    "use strict";
    e.exports = function(e, t) {
      if (t = t.split(":")[0], !(e = +e)) return !1;
      switch (t) {
        case "http":
        case "ws":
          return 80 !== e;

        case "https":
        case "wss":
          return 443 !== e;

        case "ftp":
          return 21 !== e;

        case "gopher":
          return 70 !== e;

        case "file":
          return !1;
      }
      return 0 !== e;
    };
  },