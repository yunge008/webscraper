/**
 * Module: TabEventListener
 * Source module ID: 43092
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

43092: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.TabEventListener = void 0;
  const n = r(74161),
    i = r(15524),
    o = r(36187),
    s = r(96930),
    a = r(70259);
  class l extends i.BaseWebNavigationEventListener {
    constructor(e) {
      super(e), this.timeouts = {
          tabOnHalfLoadedConvertToLoadedTimeout: void 0
        }, this.listeners = {
          tabOnUpdated: void 0,
          tabOnRemoved: void 0
        }, this.halfCompleteTimeout = 20 * a.TIME.ONE_SECOND_MS, this.listeners.tabOnUpdated = this.tabOnUpdated.bind(this),
        this.listeners.tabOnRemoved = this.tabOnRemoved.bind(this);
    }
    get isPageLoadComplete() {
      return this.state.tabOnCompleted;
    }
    get pageLoadError() {
      return this.state.tabOnRemoved ? "CHROME_TAB_CLOSED" : this.state.tabOnUnloaded ? "CHROME_TAB_CRASHED" : void 0;
    }
    initListeners() {
      chrome.tabs.onUpdated.addListener(this.listeners.tabOnUpdated), chrome.tabs.onRemoved.addListener(this.listeners.tabOnRemoved),
        this.resetState();
    }
    deInitListeners() {
      this.listeners.tabOnUpdated && (chrome.tabs.onUpdated.removeListener(this.listeners.tabOnUpdated),
        this.listeners.tabOnUpdated = void 0), this.listeners.tabOnRemoved && (chrome.tabs.onRemoved.removeListener(this.listeners.tabOnRemoved),
        this.listeners.tabOnRemoved = void 0);
    }
    setAlreadyLoaded() {
      this.state = {
        tabOnHalfCompleted: !0,
        tabOnCompleted: !0,
        tabStatus: o.TabEventListenerTabStatus.complete,
        tabOnRemoved: !1,
        tabOnUnloaded: !1
      };
    }
    resetState() {
      this.state = {
        tabOnHalfCompleted: !1,
        tabOnCompleted: !1,
        tabStatus: o.TabEventListenerTabStatus.preLoading,
        tabOnRemoved: !1,
        tabOnUnloaded: !1
      };
    }
    initTimeouts() {}
    tabOnUpdated(e, t, r) {
      e === this.sharedState.tab.tabId && (n.Log.debug("tabOnUpdated", {
        details: JSON.stringify(t),
        tab: JSON.stringify(r),
        state: JSON.stringify(this.state)
      }), t.status === s.ChromeTabStatus.complete ? this.onTabLoadComplete() : this.state.tabOnCompleted && this.state.tabStatus === o.TabEventListenerTabStatus.complete && t.status === s.ChromeTabStatus.loading && t.url !== this.sharedState.url ? this.onWindowHistoryPushStateUrlChange(t) : t.status === s.ChromeTabStatus.loading ? this.onTabStatusLoading(t) : void 0 === t.status && r.status === s.ChromeTabStatus.loading && void 0 !== t.title ? this.onLoadingTabTitleSet() : t.status === s.ChromeTabStatus.unloaded ? (n.Log.notice("tab unloaded", {
        data: JSON.stringify(t),
        event: "tabOnUpdated",
        url: t.url
      }), this.onTabUnloaded()) : this.couldIgnoreTabUpdateEvent(t) || n.Log.notice("unknown tab load half status event", {
        data: JSON.stringify(t),
        event: "tabOnUpdated",
        url: t.url
      }));
    }
    couldIgnoreTabUpdateEvent(e) {
      return void 0 !== e.favIconUrl || (void 0 !== e.isArticle || void 0 !== e.title && this.state.tabStatus === o.TabEventListenerTabStatus.complete);
    }
    onTabStatusLoading(e) {
      this.state.tabStatus === o.TabEventListenerTabStatus.preLoading ? this.setState({
        tabStatus: o.TabEventListenerTabStatus.loading
      }, {
        tabOnCompleted: !1
      }) : n.Log.info("Tab loading state is being set after it has already gone through loading state", {
        data: JSON.stringify(e),
        event: "tabOnUpdated",
        sourceUrl: this.sharedState.url,
        state: JSON.stringify(this.state),
        toUrl: e.url
      });
    }
    onTabUnloaded() {
      this.clearTimeout("tabOnHalfLoadedConvertToLoadedTimeout"), this.setState({
        tabOnUnloaded: !0
      }, {
        tabOnUnloaded: !1
      });
    }
    onWindowHistoryPushStateUrlChange(e) {
      n.Log.notice("window.history.pushState detected", {
        data: JSON.stringify(e),
        event: "tabOnUpdated",
        sourceUrl: this.sharedState.url,
        toUrl: e.url,
        hideInEsLogs: !0
      }), e.url && (this.sharedState.url = e.url), this.setState({
        tabStatus: o.TabEventListenerTabStatus.loading,
        tabOnCompleted: !1
      }, {});
    }
    onLoadingTabTitleSet() {
      if (!this.state.tabOnHalfCompleted || this.state.tabStatus !== o.TabEventListenerTabStatus.halfComplete) {
        const e = {};
        this.state.tabOnHalfCompleted || (e.tabOnHalfCompleted = !0), this.state.tabStatus !== o.TabEventListenerTabStatus.halfComplete && (e.tabStatus = o.TabEventListenerTabStatus.halfComplete),
          this.setState(e, {
            tabOnCompleted: !1
          });
      }
      this.initTabOnHalfLoadedConvertToLoadedTimeout();
    }
    onTabLoadComplete() {
      this.clearTimeout("tabOnHalfLoadedConvertToLoadedTimeout"), this.setState({
        tabOnCompleted: !0,
        tabStatus: o.TabEventListenerTabStatus.complete
      }, {});
    }
    tabOnRemoved(e) {
      e === this.sharedState.tab.tabId && (n.Log.debug("tabOnRemoved", {
        state: JSON.stringify(this.state)
      }), this.clearTimeout("tabOnHalfLoadedConvertToLoadedTimeout"), this.setState({
        tabOnRemoved: !0
      }, {}));
    }
    initTabOnHalfLoadedConvertToLoadedTimeout() {
      this.clearTimeout("tabOnHalfLoadedConvertToLoadedTimeout"), this.timeouts.tabOnHalfLoadedConvertToLoadedTimeout = setTimeout((() => {
        n.Log.info("tab status half-complete timeout timed out. Setting status to complete"),
          this.state.tabStatus === o.TabEventListenerTabStatus.halfComplete ? (this.clearTimeout("tabOnHalfLoadedConvertToLoadedTimeout"),
            this.setState({
              tabOnCompleted: !0,
              tabStatus: o.TabEventListenerTabStatus.complete
            }, {})) : n.Log.warning("unexpected tab status. Should be half complete", {
            url: this.sharedState.url,
            status: this.state.tabStatus
          });
      }), this.halfCompleteTimeout);
    }
  }
  t.TabEventListener = l;
},