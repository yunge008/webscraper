/**
 * Module: TabNetworkStatusListener
 * Source module ID: 66066
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

66066: function(e, t, r) {
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
  }), t.TabNetworkStatusListener = void 0;
  const i = r(74161),
    o = r(15752),
    s = r(87265),
    a = r(43092),
    l = r(27695),
    c = r(44479),
    u = r(39153),
    d = r(59385),
    h = r(86712),
    f = r(90195),
    p = r(25839),
    m = r(72353),
    g = r(98764);
  t.TabNetworkStatusListener = class {
    constructor(e) {
      this.sharedState = {
          url: void 0,
          waitForStatusActive: !1,
          pageLoadDelay: void 0,
          tab: void 0,
          isHashTagChange: void 0,
          minDuration: 0
        }, this.callbacks = {
          error: void 0,
          success: void 0
        }, this.eventListeners = {
          failOnErrorPagesEventListener: void 0,
          globalTimeoutEventListener: void 0,
          pageLoadDelayEventListener: void 0,
          tabEventListener: void 0,
          waitForRootElementEventListener: void 0,
          webNavigationEventListener: void 0,
          webRequestEventListener: void 0,
          ajaxEventListener: void 0,
          minDurationEventListener: void 0,
          lockEventListener: void 0
        }, this.logEventListenerChanges = !1, this.resetStateBeforeRedirect = this.resetStateBeforeRedirect.bind(this),
        this.onStateChanged = this.onStateChanged.bind(this), this.initPageLoadDelayCompletedTimeout = this.initPageLoadDelayCompletedTimeout.bind(this),
        this.webNavigationEnabled = e.webNavigationEnabled, this.sharedState.tab = e.tab;
      const t = {
        sharedState: this.sharedState,
        onRedirect: this.resetStateBeforeRedirect,
        onStateChanged: this.onStateChanged,
        onPageLoadDelayShouldBeReset: this.initPageLoadDelayCompletedTimeout
      };
      this.eventListeners.lockEventListener = new g.LockEventListener(t), this.eventListeners.minDurationEventListener = new m.MinDurationEventListener(t),
        this.eventListeners.webRequestEventListener = new o.WebRequestEventListener(t),
        this.eventListeners.tabEventListener = new a.TabEventListener(t), this.eventListeners.pageLoadDelayEventListener = new l.PageLoadDelayEventListener(t),
        this.eventListeners.globalTimeoutEventListener = new c.GlobalTimeoutEventListener(t),
        this.eventListeners.ajaxEventListener = new p.AjaxEventListener(Object.assign(Object.assign({}, t), {
          waitAjaxDomains: e.waitAjaxDomains
        })), this.eventListeners.webNavigationEventListener = new s.WebNavigationEventListener(Object.assign(Object.assign({}, t), {
          webNavigationEnabled: e.webNavigationEnabled
        })), this.eventListeners.failOnErrorPagesEventListener = new h.FailOnErrorPagesEventListener(Object.assign(Object.assign({}, t), {
          webRequestEventListener: this.eventListeners.webRequestEventListener,
          webNavigationEventListener: this.eventListeners.webNavigationEventListener,
          waitForListeners: [this.eventListeners.webRequestEventListener, this.eventListeners.tabEventListener, this.eventListeners.pageLoadDelayEventListener, this.eventListeners.webNavigationEventListener]
        })), this.eventListeners.waitForRootElementEventListener = new d.WaitForRootElementEventListener(Object.assign(Object.assign({}, t), {
          waitForListeners: [this.eventListeners.webRequestEventListener, this.eventListeners.tabEventListener, this.eventListeners.pageLoadDelayEventListener, this.eventListeners.webNavigationEventListener, this.eventListeners.failOnErrorPagesEventListener]
        }));
    }
    init() {
      for (const e in this.eventListeners) this.eventListeners[e].initListeners();
    }
    deInit() {
      for (const e in this.eventListeners) this.eventListeners[e].deInitListeners();
    }
    setMustSucceedRequests(e) {
      this.eventListeners.ajaxEventListener.setMustSucceedRequests(e);
    }
    waitForTabNetworkStatus(e) {
      return n(this, void 0, void 0, (function*() {
        if (this.sharedState.waitForStatusActive) throw new Error("Previous tab load hasn't completed");
        this.sharedState.waitForStatusActive = !0, this.sharedState.minDuration = e.minDuration <= 20 ? 20 : e.minDuration,
          this.eventListeners.minDurationEventListener.reset(), this.eventListeners.ajaxEventListener.resetAfterInitialization(),
          this.eventListeners.globalTimeoutEventListener.reset(), this.eventListeners.lockEventListener.reset(),
          e.lock && this.eventListeners.lockEventListener.lock(), yield new Promise(((e, t) => {
            this.callbacks.success = () => {
              i.Log.info("tab status network OK", {
                  url: this.sharedState.url
                }), this.clearCallbacksAndTimeouts(), this.sharedState.waitForStatusActive = !1,
                e();
            }, this.callbacks.error = e => {
              i.Log.notice("tab status network ERROR", {
                  url: this.sharedState.url,
                  error: u.Err.getMessage(e)
                }), this.clearCallbacksAndTimeouts(), this.sharedState.waitForStatusActive = !1,
                "string" == typeof e && (e = new Error(e)), t(e);
            };
          }));
      }));
    }
    getState() {
      return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, this.state), this.eventListeners.tabEventListener.state), this.eventListeners.globalTimeoutEventListener.state), this.eventListeners.pageLoadDelayEventListener.state), this.sharedState), this.eventListeners.webNavigationEventListener.state), this.eventListeners.webRequestEventListener.state), this.eventListeners.ajaxEventListener.state), this.eventListeners.minDurationEventListener.state), this.eventListeners.lockEventListener.state);
    }
    reset(e) {
      if (this.sharedState.waitForStatusActive) throw new Error("Previous tab load hasn't completed");
      this.sharedState.pageLoadDelay = e.pageLoadDelay, this.sharedState.isHashTagChange = e.isHashTagChange,
        this.sharedState.url = e.url, this.resetEventListenerStates(), this.state = {
          mainPageLoadHasCompleted: !1,
          redirectDetectedAfterMainPageLoad: !1
        };
    }
    setAlmostLoaded(e) {
      this.reset(e), this.eventListeners.tabEventListener.setAlreadyLoaded(), this.eventListeners.webNavigationEventListener.setAlreadyLoaded(),
        this.eventListeners.webRequestEventListener.setAlreadyLoaded();
    }
    unlock() {
      this.eventListeners.lockEventListener.isLocked() || i.Log.notice("lock event listener wasn't locked"),
        this.eventListeners.lockEventListener.unlock();
    }
    logIfPageCompletedWithoutWebNavigationComplete() {
      this.webNavigationEnabled && (this.eventListeners.webNavigationEventListener.state.wnOnCompleted || f.Url.isExtensionUrl(this.sharedState.url) || i.Log.notice("Page loaded without web navigation completed", {
        url: this.sharedState.url,
        state: JSON.stringify(this.state)
      }));
    }
    onStateChanged() {
      this.logEventListenerChanges && i.Log.info("page load status", {
          pageLoadDelayCompleted: this.eventListeners.pageLoadDelayEventListener.isPageLoadComplete,
          tabEventListenerCompleted: this.eventListeners.tabEventListener.isPageLoadComplete,
          webNavigationCompleted: this.eventListeners.webNavigationEventListener.isPageLoadComplete,
          webRequestCompleted: this.eventListeners.webRequestEventListener.isPageLoadComplete,
          waitForRootCompleted: this.eventListeners.waitForRootElementEventListener.isPageLoadComplete,
          failOnErrorPagesCompleted: this.eventListeners.failOnErrorPagesEventListener.isPageLoadComplete,
          globalTimeoutCompletedWithError: this.eventListeners.globalTimeoutEventListener.pageLoadError,
          tabEventListenerCompletedWithError: this.eventListeners.tabEventListener.pageLoadError,
          webNavigationCompletedWithError: this.eventListeners.webNavigationEventListener.pageLoadError,
          webRequestCompletedWithError: this.eventListeners.webRequestEventListener.pageLoadError,
          waitForRootCompletedWithError: this.eventListeners.waitForRootElementEventListener.pageLoadError,
          failOnErrorPagesCompletedWithError: this.eventListeners.failOnErrorPagesEventListener.pageLoadError
        }), this.eventListeners.waitForRootElementEventListener.onGlobalStateChanged(),
        this.isPageCompleted() && this.handlePageCompleted();
    }
    initPageLoadDelayCompletedTimeout() {
      this.eventListeners.pageLoadDelayEventListener.reset();
    }
    isPageLoadCompletedWithError() {
      if (!this.eventListeners.lockEventListener.isPageLoadComplete) return !1;
      if (!this.eventListeners.pageLoadDelayEventListener.isPageLoadComplete) return !1;
      if (this.eventListeners.globalTimeoutEventListener.pageLoadError) return !0;
      const e = this.eventListeners.failOnErrorPagesEventListener;
      if (!e.pageLoadError && !e.isPageLoadComplete) return !1;
      for (const e in this.eventListeners) {
        if (void 0 !== this.eventListeners[e].pageLoadError) return !0;
      }
      return !1;
    }
    getPageLoadCompletedErrorMessage() {
      if (!1 === this.isPageLoadCompletedWithError()) throw new Error("trying to get page load error message when no error has occurred");
      for (const e in this.eventListeners) {
        if (void 0 !== this.eventListeners[e].pageLoadError) return this.eventListeners[e].pageLoadError;
      }
      throw new Error("could not get page load error message");
    }
    isPageCompletedWithSuccess() {
      for (const e in this.eventListeners) {
        if (!this.eventListeners[e].isPageLoadComplete) return !1;
      }
      return !0;
    }
    handlePageCompleted() {
      const e = this.isPageLoadCompletedWithError(),
        t = this.isPageCompletedWithSuccess();
      if (!e && !t) throw new Error("Page completion handler called even when page hasn't completed");
      if (this.state.mainPageLoadHasCompleted = !0, e) {
        const e = this.getPageLoadCompletedErrorMessage();
        this.callbacks.error(e);
      } else if (this.isPageCompletedWithSuccess()) return this.sharedState.isHashTagChange || (this.eventListeners.webRequestEventListener.state.wrOnCompleted || i.Log.notice("Page loaded without web request completed", {
        url: this.sharedState.url,
        state: JSON.stringify(this.state)
      }), this.eventListeners.webRequestEventListener.state.headersContentType || f.Url.isExtensionUrl(this.sharedState.url) || i.Log.notice("Page loaded without content type", {
        url: this.sharedState.url,
        state: JSON.stringify(this.state),
        hideInEsLogs: !0
      }), this.logIfPageCompletedWithoutWebNavigationComplete()), void this.callbacks.success();
    }
    isPageCompleted() {
      return !(!this.isPageCompletedWithSuccess() && !this.isPageLoadCompletedWithError());
    }
    clearCallbacksAndTimeouts() {
      this.callbacks.success = void 0, this.callbacks.error = void 0;
      for (const e in this.eventListeners) this.eventListeners[e].clearTimeouts();
    }
    resetStateBeforeRedirect(e, t = !1) {
      this.sharedState.url = e, this.resetEventListenerStates(t), this.state.mainPageLoadHasCompleted && (this.state.redirectDetectedAfterMainPageLoad = !0);
    }
    resetEventListenerStates(e = !1) {
      const t = ["globalTimeoutEventListener", "lockEventListener"];
      e && t.push("tabEventListener");
      for (const e in this.eventListeners) t.includes(e) || this.eventListeners[e].reset();
    }
  };
},