/**
 * Module: ChromeTab
 * Source module ID: 25450
 * Category: chrome
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

25450: function(e, t, r) {
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
  }), t.ChromeTab = void 0;
  const i = r(74161),
    o = r(83258),
    s = r(39153),
    a = r(70259),
    l = r(70905);
  class c {
    static get(e) {
      return new Promise(((t, r) => {
        chrome.tabs.get(e, (e => {
          const n = chrome.runtime.lastError;
          null != n ? (i.Log.error("Chrome tab get error", {
            error: s.Err.getMessage(n)
          }), r(`Chrome tab get error ${s.Err.getMessage(n)}`)) : e ? t(e) : r("Chrome tab get error missing tab.");
        }));
      }));
    }
    static isAccessible(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield c.get(e);
        return new RegExp(/^(http:\/\/|https:\/\/)/).test(t.url);
      }));
    }
    static update(e, t) {
      return new Promise(((r, n) => {
        chrome.tabs.update(e, t, (e => {
          const t = chrome.runtime.lastError;
          if (null != t) {
            const e = s.Err.getMessage(t);
            s.Err.startsWithAnyOf(e, ["Invalid url"]) || i.Log.error("Chrome tab update error", {
              error: e
            }), n(`Chrome tab update error ${s.Err.getMessage(t)}`);
          } else r(e);
        }));
      }));
    }
    static waitForUrl(e, t, r, s) {
      return n(this, void 0, void 0, (function*() {
        let a;
        if (!(yield o.Async.waitForCallbackWithoutError((() => n(this, void 0, void 0, (function*() {
            return a = yield c.get(e), i.Log.debug("waiting for tab to get url", {
              url: t,
              tabUrl: a.url,
              status: a.status
            }), t === a.url;
          }))), r)) && s) throw new Error("Tab didn't load expected URL");
        return a;
      }));
    }
    static duplicate(e) {
      return new Promise(((t, r) => {
        chrome.tabs.duplicate(e, (e => {
          const n = chrome.runtime.lastError;
          null != n ? (i.Log.error("Chrome tab duplicate error", {
            error: s.Err.getMessage(n)
          }), r(`Chrome tab duplicate error: ${s.Err.getMessage(n)}`)) : e ? t(e) : r("Chrome tab duplicate error: missing tab.");
        }));
      }));
    }
    static create(e) {
      return new Promise(((t, r) => {
        chrome.tabs.create(e, (e => {
          const n = chrome.runtime.lastError;
          null != n ? (i.Log.error("Chrome tab create error", {
            error: s.Err.getMessage(n)
          }), r(`Chrome tab create error: ${s.Err.getMessage(n)}`)) : e ? t(e) : r("Chrome tab create error: missing tab.");
        }));
      }));
    }
    static remove(e) {
      return new Promise(((t, r) => {
        chrome.tabs.remove(e, (() => {
          const e = chrome.runtime.lastError;
          null != e && (i.Log.error("Chrome tab remove error", {
            error: s.Err.getMessage(e)
          }), r(`Chrome tab remove error ${s.Err.getMessage(e)}`)), t();
        }));
      }));
    }
    static query(e = {}) {
      return new Promise(((t, r) => {
        chrome.tabs.query(e, (e => {
          const n = chrome.runtime.lastError;
          if (null != n) return i.Log.error("Chrome tabs query error", {
            error: n.toString()
          }), void r(`Chrome tabs query error ${n.toString()}`);
          t(e);
        }));
      }));
    }
    static waitToBeLoaded(e) {
      return n(this, void 0, void 0, (function*() {
        const t = new Promise((t => {
          const r = (n, i) => {
            "complete" === i.status && n === e && (chrome.tabs.onUpdated.removeListener(r),
              t());
          };
          chrome.tabs.onUpdated.addListener(r);
        }));
        yield o.Async.timeoutPromise(t, a.TIME.ONE_MINUTE_MS, "waitTobeLoadedPromise");
      }));
    }
    static close(e) {
      return n(this, void 0, void 0, (function*() {
        if (void 0 === e) throw i.Log.error("trying to destroy tab when it doesn't exist"),
          "CHROME_TAB_CLOSED";
        if (!(yield c.exists(e))) throw "CHROME_TAB_CLOSED";
        yield c.remove(e);
      }));
    }
    static exists(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield c.query();
        for (const r of t)
          if (r.id === e) return !0;
        return !1;
      }));
    }
    static getLastTab(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield c.query();
        if (t.length !== e) throw new Error(`Incorrect tab count ${t.length} expected ${e}`);
        let r = t[0];
        for (const e of t) e.index > r.index && (r = e);
        if (r.url.startsWith("chrome-extension://")) throw new Error("Right most tab is extension tab");
        return {
          tabId: r.id,
          windowId: r.windowId
        };
      }));
    }
    static refresh(e, t) {
      return n(this, void 0, void 0, (function*() {
        if (!(yield l.ChromeWindow.exists(t))) throw new Error("missing window");
        i.Log.notice("refreshing tab");
        const r = yield c.create({
          windowId: t,
          url: chrome.runtime.getURL("empty-page.html"),
          active: !1
        });
        return yield o.Async.sleep(1), yield c.remove(e), r.id;
      }));
    }
    static sendMessage(e, t, r = !0) {
      return new Promise(((n, o) => {
        chrome.tabs.sendMessage(e, t, (e => {
          const s = chrome.runtime.lastError;
          if (null != s) {
            let e = s.toString();
            return "[object Object]" === e && (e = JSON.stringify(s)), r && i.Log.error("Failed to send message to chrome tab", {
              error: e,
              request: JSON.stringify(t)
            }), o(`FAILED_TO_CONNECT_TO_CHROME_TAB ${e}`);
          }
          return e.success ? n(e.response) : o(e.error);
        }));
      }));
    }
  }
  t.ChromeTab = c;
},