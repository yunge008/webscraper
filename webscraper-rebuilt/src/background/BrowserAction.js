/**
 * Module: BrowserAction
 * Source module ID: 67068
 * Category: background
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

67068: function(e, t, r) {
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
  }), t.BrowserAction = void 0;
  const i = r(25450),
    o = r(87594);
  class s {
    static init() {
      return n(this, void 0, void 0, (function*() {
        o.Browser.isFirefox() || (yield chrome.sidePanel.setPanelBehavior({
          openPanelOnActionClick: !0
        }), yield s.initSidePanelInAllTabs(), s.initSidePanelInNewTabs());
      }));
    }
    static initSidePanelInAllTabs() {
      return n(this, void 0, void 0, (function*() {
        const e = yield i.ChromeTab.query({});
        yield Promise.all(e.map((e => s.initSidePanelForTab(e))));
      }));
    }
    static initSidePanelInNewTabs() {
      chrome.tabs.onUpdated.addListener(((e, t, r) => n(this, void 0, void 0, (function*() {
        yield s.initSidePanelForTab(r);
      }))));
    }
    static initSidePanelForTab(e) {
      return n(this, void 0, void 0, (function*() {
        e.url && (yield chrome.sidePanel.setOptions({
          tabId: e.id,
          path: "sidepanel.html",
          enabled: !0
        }));
      }));
    }
  }
  t.BrowserAction = s;
},