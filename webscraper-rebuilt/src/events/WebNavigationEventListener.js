/**
 * Module: WebNavigationEventListener
 * Source module ID: 87265
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

87265: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.WebNavigationEventListener = void 0;
  const i = r(74161),
    o = r(15524),
    s = r(90195),
    a = n(r(61160));
  class l extends o.BaseWebNavigationEventListener {
    constructor(e) {
      super(e), this.listeners = {
          wnOnBeforeNavigate: void 0,
          wnOnCommitted: void 0,
          wnOnCompleted: void 0,
          wnOnErrorOccurred: void 0
        }, this.wnErrorTimeoutLength = 500, this.webNavigationEnabled = e.webNavigationEnabled,
        this.listeners.wnOnBeforeNavigate = this.wnOnBeforeNavigate.bind(this), this.listeners.wnOnCommitted = this.wnOnCommitted.bind(this),
        this.listeners.wnOnCompleted = this.wnOnCompleted.bind(this), this.listeners.wnOnErrorOccurred = this.wnOnErrorOccurred.bind(this);
    }
    get isPageLoadComplete() {
      return !this.webNavigationEnabled || (!!this.sharedState.isHashTagChange || (!!s.Url.isExtensionUrl(this.sharedState.url) || this.state.wnOnCompleted));
    }
    get pageLoadError() {
      if (this.state.wnOnErrorOccurred) return `WEB_NAVIGATION_ERROR ${this.state.wnError}`;
    }
    initListeners() {
      this.webNavigationEnabled && (chrome.webNavigation.onBeforeNavigate.addListener(this.listeners.wnOnBeforeNavigate),
        chrome.webNavigation.onCommitted.addListener(this.listeners.wnOnCommitted), chrome.webNavigation.onCompleted.addListener(this.listeners.wnOnCompleted),
        chrome.webNavigation.onErrorOccurred.addListener(this.listeners.wnOnErrorOccurred));
    }
    deInitListeners() {
      this.webNavigationEnabled && (this.listeners.wnOnBeforeNavigate && (chrome.webNavigation.onBeforeNavigate.removeListener(this.listeners.wnOnBeforeNavigate),
        this.listeners.wnOnBeforeNavigate = void 0), this.listeners.wnOnCommitted && (chrome.webNavigation.onCommitted.removeListener(this.listeners.wnOnCommitted),
        this.listeners.wnOnCommitted = void 0), this.listeners.wnOnCompleted && (chrome.webNavigation.onCompleted.removeListener(this.listeners.wnOnCompleted),
        this.listeners.wnOnCompleted = void 0), this.listeners.wnOnErrorOccurred && (chrome.webNavigation.onErrorOccurred.removeListener(this.listeners.wnOnErrorOccurred),
        this.listeners.wnOnErrorOccurred = void 0));
    }
    setAlreadyLoaded() {
      this.state = {
        wnOnBeforeNavigate: !0,
        wnOnCommitted: !0,
        wnOnCompleted: !0,
        wnOnErrorOccurred: !1,
        wnError: void 0
      };
    }
    resetState() {
      this.state = {
        wnOnBeforeNavigate: !1,
        wnOnCommitted: !1,
        wnOnCompleted: !1,
        wnOnErrorOccurred: !1,
        wnError: void 0
      };
    }
    initTimeouts() {}
    isWebNavigationMonitored(e) {
      if (0 !== e.frameId) return !1;
      if (e.tabId === this.sharedState.tab.tabId) {
        const t = (0, a.default)(e.url);
        if ("http:" === t.protocol || "https:" === t.protocol) return !0;
      } else if (!this.sharedState.tab.tabId && e.url === this.sharedState.url) return !0;
      return !1;
    }
    wnOnCommitted(e) {
      if (!this.isWebNavigationMonitored(e)) return;
      i.Log.debug("wnOnCommitted", {
        details: JSON.stringify(e),
        state: JSON.stringify(this.state)
      }), this.clearTimeout("wnErrorTimeout");
      const t = {
        wnOnCommitted: !0
      };
      this.state.wnOnBeforeNavigate || (t.wnOnBeforeNavigate = !0), this.setState(t, {
        wnOnCompleted: !1
      });
    }
    wnOnBeforeNavigate(e) {
      this.isWebNavigationMonitored(e) && (i.Log.debug("wnOnBeforeNavigate", {
        details: JSON.stringify(e),
        state: JSON.stringify(this.state)
      }), this.clearTimeout("wnErrorTimeout"), !0 === this.state.wnOnBeforeNavigate && (i.Log.info("JavaScript redirect detected", {
        sourceUrl: this.sharedState.url,
        toUrl: e.url,
        wnOnCompleted: this.state.wnOnCompleted
      }), this.onRedirect(e.url)), this.setState({
        wnOnBeforeNavigate: !0
      }, {
        wnOnCommitted: !1,
        wnOnCompleted: !1
      }));
    }
    wnOnErrorOccurred(e) {
      this.isWebNavigationMonitored(e) && (i.Log.debug("wnOnErrorOccurred", {
        details: JSON.stringify(e),
        state: JSON.stringify(this.state)
      }), this.clearTimeout("wnErrorTimeout"), this.timeouts.wnErrorTimeout = setTimeout((() => {
        this.setState({
          wnError: e.error,
          wnOnErrorOccurred: !0
        }, {
          wnOnCompleted: !1
        });
      }), this.wnErrorTimeoutLength));
    }
    wnOnCompleted(e) {
      this.isWebNavigationMonitored(e) && (i.Log.debug("wnOnCompleted", {
        details: JSON.stringify(e),
        state: JSON.stringify(this.state)
      }), this.clearTimeout("wnErrorTimeout"), this.setState({
        wnOnCompleted: !0
      }, {}));
    }
  }
  t.WebNavigationEventListener = l;
},