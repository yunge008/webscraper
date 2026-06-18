/**
 * Module: AjaxEventListener
 * Source module ID: 25839
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

25839: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.AjaxEventListener = void 0;
  const n = r(15524),
    i = r(90195),
    o = r(67849),
    s = r(70259),
    a = r(74161);
  class l extends n.BaseWebNavigationEventListener {
    constructor(e) {
      super(e), this.singleAjaxTimeout = 40 * s.TIME.ONE_SECOND_MS, this.coolDownAjaxTimeout = 100,
        this.globalTimeout = 10 * s.TIME.ONE_SECOND_MS, this.activeRequests = new Map, this.mustSucceedRequests = [],
        this.listeners = {
          onBeforeRequest: void 0,
          onCompleted: void 0,
          onErrorOccurred: void 0
        }, this.waitAjaxDomains = e.waitAjaxDomains, this.listeners.onBeforeRequest = this.onBeforeRequest.bind(this),
        this.listeners.onCompleted = this.onCompleted.bind(this), this.listeners.onErrorOccurred = this.onErrorOccurred.bind(this);
    }
    get isPageLoadComplete() {
      return this.state.ajaxGlobalTimeoutComplete || this.state.ajaxComplete;
    }
    get pageLoadError() {
      if (this.state.ajaxComplete && this.state.ajaxHasMustSucceedRequestError) return this.state.ajaxMustSucceedRequestError;
    }
    deInitListeners() {
      this.listeners.onBeforeRequest && (chrome.webRequest.onBeforeRequest.removeListener(this.listeners.onBeforeRequest),
        this.listeners.onBeforeRequest = void 0), this.listeners.onCompleted && (chrome.webRequest.onCompleted.removeListener(this.listeners.onCompleted),
        this.listeners.onCompleted = void 0), this.listeners.onErrorOccurred && (chrome.webRequest.onErrorOccurred.removeListener(this.listeners.onErrorOccurred),
        this.listeners.onErrorOccurred = void 0);
    }
    initListeners() {
      const e = {
        urls: ["<all_urls>"],
        types: ["xmlhttprequest", "sub_frame"]
      };
      chrome.webRequest.onBeforeRequest.addListener(this.listeners.onBeforeRequest, e, ["requestBody"]),
        chrome.webRequest.onCompleted.addListener(this.listeners.onCompleted, e, ["responseHeaders"]),
        chrome.webRequest.onErrorOccurred.addListener(this.listeners.onErrorOccurred, e);
    }
    setMustSucceedRequests(e) {
      this.mustSucceedRequests = e;
    }
    setAlreadyLoaded() {}
    resetAfterInitialization() {
      this.state = {
        ajaxGlobalTimeoutComplete: !1,
        ajaxGlobalTimeoutStart: Date.now(),
        ajaxComplete: this.state.ajaxComplete,
        ajaxHasMustSucceedRequestError: this.state.ajaxHasMustSucceedRequestError,
        ajaxMustSucceedRequestError: this.state.ajaxMustSucceedRequestError
      }, this.clearTimeouts(), this.initTimeouts();
    }
    initTimeouts() {}
    resetState() {
      this.state = {
        ajaxComplete: !0,
        ajaxGlobalTimeoutComplete: !1,
        ajaxGlobalTimeoutStart: Date.now(),
        ajaxHasMustSucceedRequestError: !1,
        ajaxMustSucceedRequestError: void 0
      };
      for (const e of this.activeRequests.keys()) clearTimeout(this.activeRequests.get(e)),
        this.activeRequests.delete(e);
    }
    setState(e, t) {
      this.sharedState.waitForStatusActive ? super.setState(e, t) : this.overrideState(e);
    }
    onBeforeRequest(e) {
      if (!this.isRequestMonitored(e)) return;
      this.state.ajaxComplete && this.setState({
        ajaxComplete: !1
      }, {});
      const t = setTimeout((() => {
        a.Log.notice("AJAX request timed out", {
          details: JSON.stringify(e)
        }), this.completeAjaxRequest(e.requestId);
      }), this.singleAjaxTimeout);
      this.activeRequests.set(e.requestId, t);
    }
    urlMustSucceed(e) {
      for (const t of this.mustSucceedRequests)
        if (e.toLowerCase().includes(t.url.toLowerCase())) return !0;
      return !1;
    }
    onCompleted(e) {
      e.statusCode >= 200 && e.statusCode < 300 || !this.urlMustSucceed(e.url) || this.setState({
        ajaxHasMustSucceedRequestError: !0,
        ajaxMustSucceedRequestError: `AJAX_MUST_SUCCEED_ERROR ${e.statusCode} ${e.url}`
      }, {}), this.coolDownCompleteAjaxRequest(e.requestId);
    }
    onErrorOccurred(e) {
      "net::ERR_BLOCKED_BY_CLIENT" !== e.error && (a.Log.notice("Error occurred while loading AJAX request", {
        details: JSON.stringify(e)
      }), this.urlMustSucceed(e.url) && this.setState({
        ajaxHasMustSucceedRequestError: !0,
        ajaxMustSucceedRequestError: `AJAX_MUST_SUCCEED_ERROR ${e.error} ${e.url}`
      }, {})), this.coolDownCompleteAjaxRequest(e.requestId);
    }
    coolDownCompleteAjaxRequest(e) {
      if (!this.activeRequests.has(e)) return;
      clearTimeout(this.activeRequests.get(e));
      const t = setTimeout((() => {
        this.completeAjaxRequest(e);
      }), this.coolDownAjaxTimeout);
      this.activeRequests.set(e, t);
    }
    completeAjaxRequest(e) {
      if (!this.activeRequests.has(e)) return;
      clearTimeout(this.activeRequests.get(e)), this.activeRequests.delete(e), 0 === this.activeRequests.size && this.setState({
        ajaxComplete: !0
      }, {});
      const t = o.TimeoutCounter.isTimedOut(this.globalTimeout, this.state.ajaxGlobalTimeoutStart);
      !1 === this.state.ajaxGlobalTimeoutComplete && t && this.setState({
        ajaxGlobalTimeoutComplete: !0
      }, {
        ajaxGlobalTimeoutComplete: !1
      });
    }
    isRequestMonitored(e) {
      return !![i.Url.getTopLevelDomain(this.sharedState.url), ...this.waitAjaxDomains].includes(i.Url.getTopLevelDomain(e.url)) && (e.tabId === this.sharedState.tab.tabId || -1 === e.tabId);
    }
  }
  t.AjaxEventListener = l;
},