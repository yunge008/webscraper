/**
 * Module: ContentTypeParser
 * Source module ID: 31376
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

31376: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ContentTypeParser = void 0;
  const n = r(74161);
  class i {
    static getCharset(e) {
      const t = e.match(/charset\s*=[\s"']*([^\s"';/>]*)/i);
      if (t) return t[1];
    }
    static isContentTypeUnknown(e) {
      return !!e && (!(e = e.toLocaleLowerCase()).match(/^(text\/[^\n]*?|[^\n]*?(html|xml|json)[^\n]*?|application\/[^\n]*?(java|ecma|type)script[^\n]*?)$/) && (n.Log.notice("unknown content type loaded", {
        contentType: e
      }), !0));
    }
    static isContentTypeForCompressedContent(e) {
      let t = e.replace(/;\s*(charset=)?utf-8/i, "");
      return t = t.replace(/application\//i, ""), i.compressedTypes.includes(t);
    }
  }
  t.ContentTypeParser = i, i.compressedTypes = ["octet-stream", "binary/octet-stream", "x-gzip", "gzip", "gzip-compressed", "gzipped", "x-gunzip", "x-gzip-compressed", "gzip/document", "zip"];
},