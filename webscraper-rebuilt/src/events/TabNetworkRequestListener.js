/**
 * Module: TabNetworkRequestListener
 * Source module ID: 75043
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

75043: function(e, t, r) {
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
  }), t.TabNetworkRequestListener = void 0;
  const i = r(74161),
    o = r(39153),
    s = r(70259);
  t.TabNetworkRequestListener = class {
    constructor() {
      this.decoder = new TextDecoder, this.interceptedRequestMap = new Map, this.isListening = !1,
        this.onBeforeRequestListener = this.wrOnBeforeRequest.bind(this), this.onBeforeSendHeadersListener = this.wrOnBeforeSendHeaders.bind(this),
        this.onCompletedListener = this.wrOnCompleted.bind(this), this.onErrorOccurredListener = this.wrOnErrorOccurred.bind(this);
    }
    getTabId() {
      return this.tabId;
    }
    startListening(e) {
      return n(this, void 0, void 0, (function*() {
        if (this.isListening) {
          if (this.tabId === e) return void i.Log.debug("startListening called while already active", {
            tab: this.tabId
          });
          this.stopListening();
        }
        i.Log.info("Starting to listen for network requests on tab", {
          tab: e
        }), this.interceptedRequestMap.set(e, new Map);
        const t = {
          urls: ["<all_urls>"],
          tabId: e,
          types: ["xmlhttprequest"]
        };
        chrome.webRequest.onBeforeRequest.addListener(this.onBeforeRequestListener, t, ["requestBody"]),
          chrome.webRequest.onBeforeSendHeaders.addListener(this.onBeforeSendHeadersListener, t, ["requestHeaders", "extraHeaders"]),
          chrome.webRequest.onCompleted.addListener(this.onCompletedListener, t, ["responseHeaders"]),
          chrome.webRequest.onErrorOccurred.addListener(this.onErrorOccurredListener, t);
        const r = yield chrome.tabs.get(e);
        this.tabUrl = new URL(r.url), this.isListening = !0, this.tabId = e;
      }));
    }
    stopListening() {
      chrome.webRequest.onErrorOccurred.removeListener(this.onErrorOccurredListener),
        chrome.webRequest.onCompleted.removeListener(this.onCompletedListener), chrome.webRequest.onBeforeSendHeaders.removeListener(this.onBeforeSendHeadersListener),
        chrome.webRequest.onBeforeRequest.removeListener(this.onBeforeRequestListener),
        this.isListening = !1;
    }
    replayInterceptedRequests(e) {
      return n(this, void 0, void 0, (function*() {
        const t = this.interceptedRequestMap.get(e);
        return (yield Promise.all(Array.from(t.values()).map((e => n(this, void 0, void 0, (function*() {
          const t = new Headers;
          for (const r of e.headers.split(", ")) {
            const [e, n] = r.split(": ");
            e && (e.toLowerCase().startsWith("x-") || "Content-Type" === e) && n && t.append(e, n);
          }
          try {
            const r = yield fetch(e.url, {
              method: e.method,
              body: "post" === e.method.toLowerCase() ? e.body : void 0,
              cache: "force-cache",
              headers: t,
              signal: AbortSignal.timeout(30 * s.TIME.ONE_SECOND_MS)
            });
            if (r.ok) {
              const t = yield r.text();
              if (!t || "" === t.trim()) return;
              return {
                url: e.url,
                response: t.trim()
              };
            }
            return void i.Log.notice("Failed to fetch request", {
              url: e.url,
              status: r.status
            });
          } catch (t) {
            return void i.Log.notice("Failed to fetch request", {
              url: e.url,
              error: o.Err.getMessage(t)
            });
          }
        })))))).filter(Boolean);
      }));
    }
    wrOnBeforeRequest(e) {
      if ("GET" !== e.method && "POST" !== e.method) return;
      const t = new URL(e.url);
      if (this.rootDomain(t) !== this.rootDomain(this.tabUrl)) return;
      this.interceptedRequestMap.get(this.tabId).set(e.requestId, {
        method: e.method,
        body: e.requestBody ? e.requestBody.raw.map((e => this.decoder.decode(e.bytes))).join() : "",
        url: e.url,
        type: e.type,
        headers: "",
        contentType: "",
        statusCode: ""
      });
    }
    wrOnBeforeSendHeaders(e) {
      const t = this.interceptedRequestMap.get(this.tabId);
      t.has(e.requestId) && (t.get(e.requestId).headers = e.requestHeaders.map((e => `${e.name}: ${e.value}`)).join(", "));
    }
    wrOnCompleted(e) {
      const t = this.interceptedRequestMap.get(this.tabId);
      if (!t.has(e.requestId)) return;
      if (e.statusCode < 200 || e.statusCode >= 400) return void t.delete(e.requestId);
      let r = "";
      for (const t of e.responseHeaders) "content-type" === t.name.toLowerCase() && (r = t.value);
      if (!r.includes("json") && !r.includes("javascript")) return void t.delete(e.requestId);
      const n = t.get(e.requestId);
      n.statusCode = e.statusCode.toString(), n.contentType = r;
    }
    wrOnErrorOccurred(e) {
      this.interceptedRequestMap.get(this.tabId).delete(e.requestId);
    }
    rootDomain(e) {
      const t = e.hostname.split(".");
      return t.length < 2 ? e.hostname : t.slice(-2).join(".");
    }
  };
},