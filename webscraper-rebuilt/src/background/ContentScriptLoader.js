/**
 * Module: ContentScriptLoader
 * Source module ID: 73350
 * Category: background
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

73350: function(e, t, r) {
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
  }), t.ContentScriptLoader = void 0;
  const i = r(25450);
  class o {
    static injectContentScript(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield chrome.scripting.getRegisteredContentScripts({
          ids: ["web_scraper_content_script"]
        });
        const r = yield i.ChromeTab.get(e);
        yield o.injectContentScriptInTab(r);
        if (t && t.length > 0) return;
        const n = yield i.ChromeTab.query({});
        for (const t of n) t.id !== e && o.injectContentScriptInTab(t);
        yield chrome.scripting.registerContentScripts([{
          id: "web_scraper_content_script",
          js: ["content_script.js"],
          css: ["content_script.css"],
          matches: ["<all_urls>"],
          persistAcrossSessions: !1
        }]);
      }));
    }
    static injectContentScriptInTab(e) {
      return n(this, void 0, void 0, (function*() {
        if ("about:blank" !== e.url) try {
          yield chrome.scripting.executeScript({
            target: {
              tabId: e.id
            },
            files: ["content_script.js"],
            injectImmediately: !0
          }), yield chrome.scripting.insertCSS({
            target: {
              tabId: e.id
            },
            files: ["content_script.css"]
          });
        } catch (e) {}
      }));
    }
  }
  t.ContentScriptLoader = o;
},
