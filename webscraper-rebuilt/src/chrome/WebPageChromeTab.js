/**
 * Module: WebPageChromeTab
 * Source module ID: 46715
 * Category: chrome
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

46715: function(e, t, r) {
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
  }), t.WebPageChromeTab = void 0;
  const i = r(12024),
    o = r(1392),
    s = r(18211),
    a = r(10073),
    l = r(74161),
    c = r(39153);
  class u extends i.WebPageDriverBase {
    launch(e, t) {
      return n(this, void 0, void 0, (function*() {
        this.chromeClient = new o.ChromeClient({
          tabId: e.tabId,
          windowId: e.windowId,
          pageLoadDelay: e.pageLoadDelay,
          failOnErrorPages: !0,
          reloadPageBeforeHashTagChange: !1,
          waitAjaxDomains: []
        }), yield this.chromeClient.init();
      }));
    }
    deInitMixins() {
      this.chromeClient.deInitMixins();
    }
    openPage(e, t) {
      return n(this, void 0, void 0, (function*() {
        yield this.chromeClient.openPage(e, t);
      }));
    }
    getElements(e) {
      return n(this, arguments, void 0, (function*(e, t = 0) {
        return (yield this.chromeClient.getElements(e, void 0, t)).map((e => new s.WebPageChromeTabElement(e, this.chromeClient)));
      }));
    }
    getElement(e) {
      return n(this, arguments, void 0, (function*(e, t = 0) {
        const r = yield this.chromeClient.getElement(e, void 0, t);
        return null === r ? r : new s.WebPageChromeTabElement(r, this.chromeClient);
      }));
    }
    close() {
      return n(this, void 0, void 0, (function*() {
        if (void 0 !== this.chromeClient) try {
          yield this.chromeClient.close(), this.chromeClient = void 0;
        } catch (e) {
          throw l.Log.notice("An error occurred while closing browser", {
            error: c.Err.getMessage(e)
          }), e;
        }
      }));
    }
    getRootElement() {
      return n(this, void 0, void 0, (function*() {
        const e = yield this.chromeClient.getRootElement();
        return new s.WebPageChromeTabElement(e, this.chromeClient);
      }));
    }
    getProxyConfiguration() {}
    getDriverType() {
      return a.WebPageDriverType.chrometab;
    }
    getUserAgent() {}
    getPageLoadState() {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.getPageLoadState();
      }));
    }
    waitForPageLoadComplete(e) {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.waitForPageLoadComplete(e);
      }));
    }
    isReachable() {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.checkContentScriptReachable();
      }));
    }
    isPageErrorStatusCode() {
      return this.chromeClient.isPageErrorStatusCode();
    }
    getPageHtml() {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.getPageHtml();
      }));
    }
    setNetworkListenerPageAlmostLoaded() {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.setNetworkListenerPageAlmostLoaded();
      }));
    }
    getPageUrl() {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.getPageUrl();
      }));
    }
    refreshTab() {
      return this.chromeClient.refreshTab();
    }
    isJsDisabled() {
      return !1;
    }
    findWssBlacklistedElements(e) {
      return n(this, void 0, void 0, (function*() {
        return Promise.resolve();
      }));
    }
    clearWssBlacklistedElements() {
      return n(this, void 0, void 0, (function*() {
        return Promise.resolve();
      }));
    }
    setWssWhitelistSelectors(e) {
      return n(this, void 0, void 0, (function*() {
        return Promise.resolve();
      }));
    }
    clearWssWhitelistSelectors() {
      return n(this, void 0, void 0, (function*() {
        return Promise.resolve();
      }));
    }
    getZoom() {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.getZoom();
      }));
    }
  }
  t.WebPageChromeTab = u;
},