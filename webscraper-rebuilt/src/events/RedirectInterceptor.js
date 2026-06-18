/**
 * Module: RedirectInterceptor
 * Source module ID: 76432
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

76432: function(e, t, r) {
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
  }), t.RedirectInterceptor = void 0;
  const i = r(74465),
    o = r(83258),
    s = r(70259),
    a = r(14937),
    l = r(25450),
    c = ["WWW-Authenticate", "Authorization", "Proxy-Authenticate", "Proxy-Authorization", "Cookie", "Set-Cookie", "Origin", "Referer"];
  t.RedirectInterceptor = class {
    constructor(e) {
      this.tabId = e, this.headerRules = [];
      for (const e of c) this.headerRules.push({
        header: e,
        operation: "remove"
      });
    }
    interceptRedirect(e, t) {
      return n(this, void 0, void 0, (function*() {
        yield i.ChromeDeclarativeNetRequest.updateSessionRules({
          addRules: [{
            id: a.DECLARATIVE_NET_REQUEST_RULE_ID.GET_REDIRECT_LINK,
            priority: 1,
            action: {
              type: "redirect",
              redirect: {
                url: null != t ? t : "https://webscraper.io/extension-response-204"
              }
            },
            condition: {
              resourceTypes: ["main_frame"],
              tabIds: [this.tabId]
            }
          }, {
            id: a.DECLARATIVE_NET_REQUEST_RULE_ID.REDIRECT_SECURE_HEADERS,
            priority: 1,
            action: {
              type: "modifyHeaders",
              requestHeaders: this.headerRules
            },
            condition: {
              resourceTypes: ["main_frame"],
              tabIds: [this.tabId]
            }
          }]
        });
        const r = this.getRedirectUrlPromise(),
          n = this.getTabUrlPromise();
        yield o.Async.sleep(5), yield e();
        const l = Promise.race([r, n]),
          c = yield o.Async.timeoutPromiseWithoutTimeoutError(l, 5 * s.TIME.ONE_SECOND_MS, "Failed to fetch redirect url");
        return yield this.cleanUp(), c;
      }));
    }
    onBeforeRedirectListenerFactory(e) {
      return t => {
        e(t.url);
      };
    }
    onTabCreatedListenerFactory(e) {
      return t => {
        t.openerTabId === this.tabId && void 0 === this.onTabUpdateListener && (this.onTabUpdateListener = this.onTabUpdateListenerFactory(e, t.id),
          chrome.tabs.onUpdated.addListener(this.onTabUpdateListener));
      };
    }
    onTabUpdateListenerFactory(e, t) {
      return this.openedTabId = t, (r, n) => {
        r === t && n.url && "about:blank" !== n.url && e(n.url);
      };
    }
    getTabUrlPromise() {
      return new Promise((e => {
        this.onTabCreatedListener = this.onTabCreatedListenerFactory((t => {
          e(t);
        })), chrome.tabs.onCreated.addListener(this.onTabCreatedListener);
      }));
    }
    getRedirectUrlPromise() {
      const e = {
        tabId: this.tabId,
        types: ["main_frame"],
        urls: ["<all_urls>"]
      };
      return new Promise((t => {
        this.onBeforeRedirectCallback = this.onBeforeRedirectListenerFactory((e => {
          t(e);
        })), chrome.webRequest.onBeforeRedirect.addListener(this.onBeforeRedirectCallback, e);
      }));
    }
    cleanUpRedirect() {
      this.onBeforeRedirectCallback && (chrome.webRequest.onBeforeRedirect.removeListener(this.onBeforeRedirectCallback),
        this.onBeforeRedirectCallback = void 0);
    }
    cleanUpRedirectRule() {
      return n(this, void 0, void 0, (function*() {
        yield i.ChromeDeclarativeNetRequest.updateSessionRules({
          removeRuleIds: [a.DECLARATIVE_NET_REQUEST_RULE_ID.GET_REDIRECT_LINK, a.DECLARATIVE_NET_REQUEST_RULE_ID.REDIRECT_SECURE_HEADERS]
        });
      }));
    }
    cleanUpTabListeners() {
      this.onTabCreatedListener && (chrome.tabs.onCreated.removeListener(this.onTabCreatedListener),
        this.onTabCreatedListener = void 0), this.onTabUpdateListener && (chrome.tabs.onUpdated.removeListener(this.onTabUpdateListener),
        this.onTabUpdateListener = void 0);
    }
    cleanUpTab() {
      return n(this, void 0, void 0, (function*() {
        this.openedTabId && (yield l.ChromeTab.remove(this.openedTabId), this.openedTabId = void 0);
      }));
    }
    cleanUp() {
      return n(this, void 0, void 0, (function*() {
        this.cleanUpRedirect(), this.cleanUpTabListeners(), yield Promise.all([this.cleanUpRedirectRule(), this.cleanUpTab()]);
      }));
    }
  };
},