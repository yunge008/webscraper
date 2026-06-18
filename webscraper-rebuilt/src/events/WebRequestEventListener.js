/**
 * Module: WebRequestEventListener
 * Source module ID: 15752
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

15752: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.WebRequestEventListener = void 0;
  const n = r(15524),
    i = r(74161),
    o = r(31376),
    s = r(70259),
    a = r(90195);
  class l extends n.BaseWebNavigationEventListener {
    constructor(e) {
      super(e), this.onBeforeRequestTimeout = s.TIME.ONE_SECOND_MS, this.webRequestCompleteTimeout = 10 * s.TIME.ONE_SECOND_MS,
        this.listeners = {
          wrOnCompleted: void 0,
          wrOnHeadersReceived: void 0,
          wrOnBeforeRedirect: void 0,
          wrOnResponseStarted: void 0,
          wrOnErrorOccurred: void 0,
          wrOnBeforeRequest: void 0
        }, this.wrErrorTimeoutLength = s.TIME.ONE_SECOND_MS, this.listeners.wrOnBeforeRequest = this.wrOnBeforeRequest.bind(this),
        this.listeners.wrOnHeadersReceived = this.wrOnHeadersReceived.bind(this), this.listeners.wrOnBeforeRedirect = this.wrOnBeforeRedirect.bind(this),
        this.listeners.wrOnResponseStarted = this.wrOnResponseStarted.bind(this), this.listeners.wrOnCompleted = this.wrOnCompleted.bind(this),
        this.listeners.wrOnErrorOccurred = this.wrOnErrorOccurred.bind(this);
    }
    get isPageLoadComplete() {
      return !!this.sharedState.isHashTagChange || (!!this.state.wrOnCompleted || !(!this.state.wrOnBeforeRequestTimeout && !this.state.wrOnCompletedTimeout));
    }
    get pageLoadError() {
      if (this.state.wrOnErrorOccurred) return `PAGE_REQUEST_ERROR ${this.state.wrError}`;
    }
    initListeners() {
      const e = {
        urls: ["<all_urls>"],
        types: ["main_frame", "xmlhttprequest"]
      };
      chrome.webRequest.onBeforeRequest.addListener(this.listeners.wrOnBeforeRequest, e, ["requestBody"]),
        chrome.webRequest.onHeadersReceived.addListener(this.listeners.wrOnHeadersReceived, e, ["responseHeaders"]),
        chrome.webRequest.onBeforeRedirect.addListener(this.listeners.wrOnBeforeRedirect, e, ["responseHeaders"]),
        chrome.webRequest.onResponseStarted.addListener(this.listeners.wrOnResponseStarted, e, ["responseHeaders"]),
        chrome.webRequest.onCompleted.addListener(this.listeners.wrOnCompleted, e, ["responseHeaders"]),
        chrome.webRequest.onErrorOccurred.addListener(this.listeners.wrOnErrorOccurred, e);
    }
    deInitListeners() {
      this.listeners.wrOnBeforeRequest && (chrome.webRequest.onBeforeRequest.removeListener(this.listeners.wrOnBeforeRequest),
        this.listeners.wrOnBeforeRequest = void 0), this.listeners.wrOnHeadersReceived && (chrome.webRequest.onHeadersReceived.removeListener(this.listeners.wrOnHeadersReceived),
        this.listeners.wrOnHeadersReceived = void 0), this.listeners.wrOnResponseStarted && (chrome.webRequest.onResponseStarted.removeListener(this.listeners.wrOnResponseStarted),
        this.listeners.wrOnResponseStarted = void 0), this.listeners.wrOnCompleted && (chrome.webRequest.onCompleted.removeListener(this.listeners.wrOnCompleted),
        this.listeners.wrOnCompleted = void 0), this.listeners.wrOnErrorOccurred && (chrome.webRequest.onErrorOccurred.removeListener(this.listeners.wrOnErrorOccurred),
        this.listeners.wrOnErrorOccurred = void 0);
    }
    setAlreadyLoaded() {
      this.state = {
        headersContentType: "text/html",
        headersStatusCode: 200,
        wrOnBeforeRequest: !0,
        wrOnBeforeRequestTimeout: !1,
        wrOnErrorOccurred: !1,
        wrError: "",
        wrOnHeadersReceived: !0,
        wrOnProxyAuthHeadersReceived: !1,
        wrOnResponseStarted: !0,
        wrOnCompleted: !0,
        wrOnCompletedTimeout: !1,
        headers: []
      };
    }
    resetState() {
      this.state = {
        headersContentType: "",
        headersStatusCode: 0,
        wrOnBeforeRequest: !1,
        wrOnBeforeRequestTimeout: !1,
        wrOnErrorOccurred: !1,
        wrError: "",
        wrOnHeadersReceived: !1,
        wrOnProxyAuthHeadersReceived: !1,
        wrOnResponseStarted: !1,
        wrOnCompleted: !1,
        wrOnCompletedTimeout: !1,
        headers: []
      };
    }
    initTimeouts() {
      this.sharedState.isHashTagChange || this.state.wrOnBeforeRequest || this.state.wrOnBeforeRequestTimeout || this.initWrOnBeforeRequestTimeout();
    }
    initWrOnBeforeRequestTimeout() {
      this.sharedState.isHashTagChange || (this.clearTimeout("wrOnBeforeRequestTimeout"),
        this.timeouts.wrOnBeforeRequestTimeout = setTimeout((() => {
          this.clearTimeout("wrOnBeforeRequestTimeout"), i.Log.notice("missed on before request event. maybe a service worker is loading this or page load is retried after web navigation error", {
            url: this.sharedState.url,
            event: "wrOnBeforeRequestTimeout"
          }), this.setState({
            wrOnBeforeRequestTimeout: !0
          }, {
            wrOnBeforeRequest: !1,
            wrOnHeadersReceived: !1,
            wrOnResponseStarted: !1,
            wrOnCompleted: !1
          });
        }), this.onBeforeRequestTimeout));
    }
    isRequestMonitored(e) {
      const t = -1 === e.tabId && "xmlhttprequest" === e.type && e.url === this.sharedState.url,
        r = e.tabId === this.sharedState.tab.tabId && -1 === e.parentFrameId && "main_frame" === e.type;
      return !(!t && !r);
    }
    wrOnBeforeRequest(e) {
      if (this.isRequestMonitored(e)) {
        if (i.Log.debug("wrOnBeforeRequest", {
            details: JSON.stringify(e),
            state: JSON.stringify(this.state)
          }), this.clearTimeout("wrErrorTimeout"), !0 === this.state.wrOnBeforeRequest)
          if (-1 === e.tabId && "xmlhttprequest" === e.type && e.url === this.sharedState.url) i.Log.info("Worker is reloading page"),
            this.reset();
          else {
            i.Log.info("JavaScript redirect detected", {
              sourceUrl: this.sharedState.url,
              toUrl: e.url,
              wrOnCompleted: this.state.wrOnCompleted,
              initiator: e.initiator
            });
            const t = a.Url.isExtensionUrl(e.initiator);
            this.onRedirect(e.url, t);
          }
        this.clearTimeout("wrOnBeforeRequestTimeout"), this.setState({
          wrOnBeforeRequest: !0
        }, {
          wrOnHeadersReceived: !1,
          wrOnResponseStarted: !1,
          wrOnCompleted: !1,
          headersContentType: "",
          headersStatusCode: 0,
          wrOnCompletedTimeout: !1
        }), this.initWrOnCompletedTimeout();
      }
    }
    wrOnBeforeRedirect(e) {
      if (!this.isRequestMonitored(e)) return;
      i.Log.debug("wrOnBeforeRedirect", {
        details: JSON.stringify(e),
        state: JSON.stringify(this.state)
      }), this.clearTimeout("wrErrorTimeout"), i.Log.info("onBeforeRedirect received", {
        sourceUrl: this.sharedState.url,
        toUrl: e.redirectUrl
      });
      const t = {
        wrOnBeforeRequest: !0
      };
      !this.state.wrOnHeadersReceived && this.state.wrOnProxyAuthHeadersReceived ? i.Log.notice("missed wrOnHeadersReceived event but received wrOnBeforeRedirect. This is due to a proxy auth + miss headers bug in chrome", {
        url: e.url,
        event: "wrOnBeforeRedirect",
        hideInEsLogs: !0
      }) : t.wrOnHeadersReceived = !0, this.assertState("wrOnBeforeRedirect", t), this.onRedirect(e.redirectUrl);
    }
    wrOnHeadersReceived(e) {
      if (!this.isRequestMonitored(e)) return;
      if (i.Log.debug("wrOnHeadersReceived", {
          details: JSON.stringify(e),
          state: JSON.stringify(this.state)
        }), this.clearTimeout("wrErrorTimeout"), 407 === e.statusCode) return void this.setState({
        wrOnProxyAuthHeadersReceived: !0
      }, {
        wrOnHeadersReceived: !1
      });
      this.onPageLoadDelayShouldBeReset();
      const t = this.extractContentTypeFromResponseHeaders(e.responseHeaders);
      t || [301, 302, 303, 307, 308, 503].includes(e.statusCode) || i.Log.notice(`missing Content Type even though headers received. ${JSON.stringify(e.responseHeaders)}`, {
        event: "wrOnHeadersReceived",
        url: e.url,
        hideInEsLogs: !0
      }), o.ContentTypeParser.isContentTypeUnknown(t) && i.Log.notice("Request with unknown content type in main frame", {
        requestUrl: e.url,
        type: e.type,
        requestTabId: e.tabId,
        currentTabId: this.sharedState.tab.tabId,
        requestParentFrameId: e.parentFrameId,
        headers: JSON.stringify(e.responseHeaders)
      });
      const r = {
        wrOnHeadersReceived: !0,
        headersStatusCode: e.statusCode,
        headers: e.responseHeaders
      };
      t && (r.headersContentType = t), this.state.wrOnErrorOccurred && (r.wrError = "",
        r.wrOnErrorOccurred = !1), this.setState(r, {
        wrOnResponseStarted: !1,
        wrOnCompleted: !1
      });
    }
    extractContentTypeFromResponseHeaders(e) {
      if (!e) return "";
      for (const t of e)
        if ("content-type" === t.name.toLowerCase()) return t.value;
      return "";
    }
    wrOnResponseStarted(e) {
      if (!this.isRequestMonitored(e)) return;
      if (i.Log.debug("wrOnResponseStarted", {
          details: JSON.stringify(e),
          state: JSON.stringify(this.state)
        }), this.clearTimeout("wrErrorTimeout"), this.state.wrOnProxyAuthHeadersReceived && !this.state.wrOnHeadersReceived) {
        i.Log.notice("missed wrOnHeadersReceived event but received wrOnResponseStarted. This is due to a proxy auth + miss headers bug in chrome", {
          url: e.url,
          event: "wrOnResponseStarted",
          hideInEsLogs: !0
        });
        const t = this.extractContentTypeFromResponseHeaders(e.responseHeaders),
          r = {
            wrOnHeadersReceived: !0,
            headersStatusCode: e.statusCode,
            headers: e.responseHeaders
          };
        t && (r.headersContentType = t), this.setState(r, {
          wrOnResponseStarted: !1,
          wrOnCompleted: !1
        }), this.onPageLoadDelayShouldBeReset();
      }
      let t = {
        wrOnBeforeRequest: !0,
        wrOnHeadersReceived: !0,
        wrOnCompleted: !1
      };
      this.isChromeExtensionUrl() && (t = {}), this.setState({
        wrOnResponseStarted: !0
      }, t);
    }
    wrOnCompleted(e) {
      this.isRequestMonitored(e) && (i.Log.debug("wrOnCompleted", {
          details: JSON.stringify(e),
          state: JSON.stringify(this.state)
        }), this.clearTimeout("wrErrorTimeout"), this.clearTimeout("wrOnCompletedTimeout"),
        i.Log.logAcceptChHeaderValues(e.responseHeaders), this.setState({
          wrOnCompleted: !0
        }, {}));
    }
    wrOnErrorOccurred(e) {
      this.isRequestMonitored(e) && (i.Log.debug("wrOnErrorOccurred", {
        details: JSON.stringify(e),
        state: JSON.stringify(this.state)
      }), this.clearTimeout("wrErrorTimeout"), this.timeouts.wrErrorTimeout = setTimeout((() => {
        i.Log.notice("web request error occurred", {
          url: e.url,
          event: "wrOnErrorOccurred",
          error: e.error
        }), this.clearTimeouts(), this.setState({
          wrOnErrorOccurred: !0,
          wrError: e.error
        }, {
          wrOnCompleted: !1
        });
      }), this.wrErrorTimeoutLength));
    }
    initWrOnCompletedTimeout() {
      this.clearTimeout("wrOnCompletedTimeout"), this.timeouts.wrOnCompletedTimeout = setTimeout((() => {
        this.clearTimeout("wrOnCompletedTimeout"), this.setState({
          wrOnCompletedTimeout: !0
        }, {
          wrOnCompleted: !1
        });
      }), this.webRequestCompleteTimeout);
    }
  }
  t.WebRequestEventListener = l;
},