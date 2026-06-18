/**
 * Module: ChromeClient
 * Source module ID: 1392
 * Category: chrome
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

1392: function(e, t, r) {
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
  }), t.ChromeClient = void 0;
  const i = r(83258),
    o = r(74161),
    s = r(66066),
    a = r(90195),
    l = r(25450),
    c = r(70259),
    u = r(76432),
    d = r(94606),
    h = r(70905),
    f = r(89403),
    p = r(39153),
    m = r(67849),
    g = r(81614);
  class v extends((0, f.proxyClass)()) {
    constructor(e) {
      return super(), this.tab = {
          tabId: void 0,
          windowId: void 0
        }, this.messageTimeoutLength = 5 * c.TIME.ONE_SECOND_MS, void 0 !== e.tabId && (this.tab.tabId = e.tabId),
        void 0 !== e.windowId && (this.tab.windowId = e.windowId), this.pageLoadDelay = e.pageLoadDelay,
        this.failOnErrorPages = e.failOnErrorPages, this.reloadPageBeforeHashTagChange = e.reloadPageBeforeHashTagChange,
        this.tabNetworkStatusListener = new s.TabNetworkStatusListener({
          tab: this.tab,
          webNavigationEnabled: "undefined" == typeof chrome || void 0 !== chrome.webNavigation,
          waitAjaxDomains: e.waitAjaxDomains
        }), this.asProxy();
    }
    deInitMixins() {
      this.tabNetworkStatusListener.deInit();
    }
    close() {
      return n(this, void 0, void 0, (function*() {
        yield l.ChromeTab.close(this.tab.tabId), this.tab.tabId = void 0, this.tab.windowId = void 0;
      }));
    }
    init() {
      return n(this, void 0, void 0, (function*() {
        return this.tabNetworkStatusListener.init();
      }));
    }
    isHashTagOnlyChange(e) {
      return n(this, void 0, void 0, (function*() {
        if (this.reloadPageBeforeHashTagChange) return !1;
        if (null === e.match(/#/)) return !1;
        const t = yield new Promise(((e, t) => {
          chrome.tabs.get(this.tab.tabId, (r => {
            const n = chrome.runtime.lastError;
            if (null != n) return o.Log.error("Failed to get tab info", {
              error: n.toString()
            }), void t(`Failed to get tab info${n.toString()}`);
            const i = r.url;
            e(i);
          }));
        }));
        return a.Url.isHashTagChange(t, e);
      }));
    }
    setMustSucceedRequests(e) {
      return this.tabNetworkStatusListener.setMustSucceedRequests(e), Promise.resolve();
    }
    openPage(e, t) {
      return n(this, void 0, void 0, (function*() {
        o.Log.info("opening page", {
          url: e
        });
        const t = yield h.ChromeWindow.exists(this.tab.windowId);
        let r = !1;
        t && (r = yield this.isHashTagOnlyChange(e)), this.tabNetworkStatusListener.reset({
          isHashTagChange: r,
          pageLoadDelay: this.pageLoadDelay,
          url: e
        }), yield Promise.all([this.tabNetworkStatusListener.waitForTabNetworkStatus({
          minDuration: 0,
          lock: !1
        }), (() => n(this, void 0, void 0, (function*() {
          if (t) yield this.loadPageInTab(e);
          else {
            const t = yield l.ChromeTab.create({
              url: e
            });
            this.tab.tabId = t.id, this.tab.windowId = t.windowId;
          }
        })))()]), yield this.waitForPageLoad();
      }));
    }
    refreshTab() {
      return n(this, void 0, void 0, (function*() {
        this.tab.tabId = yield l.ChromeTab.refresh(this.tab.tabId, this.tab.windowId);
      }));
    }
    getPageLoadState() {
      return n(this, void 0, void 0, (function*() {
        const e = this.tabNetworkStatusListener.getState();
        return {
          contentType: e.headersContentType,
          redirectedAfterPageLoadComplete: e.redirectDetectedAfterMainPageLoad,
          statusCode: e.headersStatusCode,
          webRequestCompleted: e.wrOnCompleted,
          headers: e.headers
        };
      }));
    }
    setNetworkListenerPageAlmostLoaded() {
      return n(this, void 0, void 0, (function*() {
        const e = yield l.ChromeTab.get(this.tab.tabId);
        this.tabNetworkStatusListener.setAlmostLoaded({
          isHashTagChange: !1,
          pageLoadDelay: 100,
          url: e.url
        });
      }));
    }
    waitForPageLoadComplete(e, t) {
      return n(this, void 0, void 0, (function*() {
        yield this.tabNetworkStatusListener.waitForTabNetworkStatus({
          minDuration: e,
          lock: !1
        });
      }));
    }
    getRedirectLink(e) {
      return new u.RedirectInterceptor(this.tab.tabId).interceptRedirect((() => this.click(e, d.ClickActionTypes.real)));
    }
    isPageErrorStatusCode() {
      return this.tabNetworkStatusListener.getState().headersStatusCode >= 400 && this.failOnErrorPages ? Promise.resolve(!0) : Promise.resolve(!1);
    }
    isJsDisabled() {
      return !1;
    }
    useLastTab(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield l.ChromeTab.getLastTab(e);
        this.tab.tabId = t.tabId, this.tab.windowId = t.windowId;
      }));
    }
    getElements(e, t) {
      return n(this, arguments, void 0, (function*(e, t, r = 0) {
        const n = new m.TimeoutCounter(r);
        for (;;) {
          const r = new m.TimeoutCounter(1e3);
          try {
            const r = yield this.sendMessage("getElements", !1, e, t);
            if (r.length || n.isTimedOut()) return r;
          } catch (t) {
            if (p.Err.startsWith(t, 'FAILED_TO_CONNECT_TO_CHROME_TAB {"message":"The message port closed before a response was received."}')) throw new Error(`BAD_CSS_SELECTOR ${e}`);
            throw t;
          } finally {
            r.isTimedOut() && this.tab.tabId && o.Log.notice("Slow CSS selector", {
              selector: e
            });
          }
          yield i.Async.sleep(100);
        }
      }));
    }
    getElement(e, t) {
      return n(this, arguments, void 0, (function*(e, t, r = 0) {
        const n = yield this.getElements(e, t, r);
        return 0 === n.length ? null : n[0];
      }));
    }
    downloadUrl(e) {
      return n(this, void 0, void 0, (function*() {
        let t;
        try {
          t = yield this.sendMessage("downloadUrl", !1, e);
        } catch (r) {
          const n = new g.DownloadUrlAction;
          t = yield n.extract(e);
        }
        return t;
      }));
    }
    checkContentScriptReachable() {
      return n(this, void 0, void 0, (function*() {
        try {
          return yield i.Async.timeoutPromise(this.sendMessage("getRootElement", !0), this.messageTimeoutLength, "Content script is not responding"),
            !0;
        } catch (e) {
          const t = ["Could not establish connection. Receiving end does not exist.", "Content script is not responding"];
          if (p.Err.includesAnyOf(e, t)) return !1;
          throw o.Log.error("unexpected error message when connecting to content script", {
            error: e.toString()
          }), e;
        }
      }));
    }
    getDataWithScript(e, t) {
      throw new Error("Script evaluation not possible in MV3");
    }
    getPopupURL(e) {
      throw new Error("Script evaluation not possible in MV3");
    }
    getZoom() {
      return n(this, void 0, void 0, (function*() {
        return 1;
      }));
    }
    sendMessage(e, t, ...r) {
      return n(this, void 0, void 0, (function*() {
        const n = {
          method: e,
          params: r
        };
        try {
          return yield l.ChromeTab.sendMessage(this.tab.tabId, n, !t);
        } catch (e) {
          throw new Error(`${p.Err.getMessage(e)} at ${n.method} with ${JSON.stringify(n.params)}`);
        }
      }));
    }
    asProxy() {
      return new Proxy(this, {
        get: (e, t) => void 0 !== e[t] ? e[t] : e.sendMessage.bind(e, t, !1)
      });
    }
    loadPageInTab(e) {
      return n(this, void 0, void 0, (function*() {
        o.Log.debug("Loading url in tab", {
          url: e
        });
        const t = l.ChromeTab.update(this.tab.tabId, {
          url: e
        });
        yield i.Async.timeoutPromise(t, c.TIME.ONE_MINUTE_MS, "tabUpdatePromise");
      }));
    }
  }
  t.ChromeClient = v;
},