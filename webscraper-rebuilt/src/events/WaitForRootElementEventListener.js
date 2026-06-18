/**
 * Module: WaitForRootElementEventListener
 * Source module ID: 59385
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

59385: function(e, t, r) {
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
  }), t.WaitForRootElementEventListener = void 0;
  const i = r(15524),
    o = r(83258),
    s = r(74161),
    a = r(90195),
    l = r(25450),
    c = r(96930),
    u = r(39153),
    d = r(67849),
    h = r(70259);
  class f extends i.BaseWebNavigationEventListener {
    constructor(e) {
      super(e), this.waitId = 0, this.waitForRootTimeout = 30 * h.TIME.ONE_SECOND_MS,
        this.waitForListeners = e.waitForListeners;
    }
    get pageLoadError() {
      return this.state.rootElementLookupTimedOut ? "WAIT_FOR_ROOT_ELEMENT_TIMEOUT" : this.state.tabStatusUnloaded ? "CHROME_TAB_CRASHED wait-for-root-element" : void 0;
    }
    get isPageLoadComplete() {
      return !!a.Url.isExtensionUrl(this.sharedState.url) || this.state.rootElementFound;
    }
    onGlobalStateChanged() {
      if (a.Url.isExtensionUrl(this.sharedState.url)) return;
      if (this.state.rootElementFound) return;
      const e = this.haveOtherListenersCompleted();
      e && !this.waitActive ? (this.waitActive = !0, this.launchRootElementWaiter()) : e || (this.waitActive = !1);
    }
    deInitListeners() {}
    initListeners() {}
    setAlreadyLoaded() {
      throw new Error("Currently not intended to call setAlreadyLoaded on WaitForRootElementEventListener");
    }
    initTimeouts() {}
    resetState() {
      this.state = {
        rootElementFound: !1,
        rootElementLookupTimedOut: !1,
        tabStatusUnloaded: !1
      }, this.waitActive = !1;
    }
    haveOtherListenersCompleted() {
      for (const e of this.waitForListeners)
        if (void 0 !== e.pageLoadError || !e.isPageLoadComplete) return !1;
      return !0;
    }
    launchRootElementWaiter() {
      return n(this, void 0, void 0, (function*() {
        const e = new d.TimeoutCounter(this.waitForRootTimeout);
        this.waitId++;
        const t = this.waitId;
        do {
          try {
            if ((yield l.ChromeTab.get(this.sharedState.tab.tabId)).status === c.ChromeTabStatus.unloaded) return s.Log.notice("WaitForRootElementEventListener detected that tab has crashed. Stop waiting"),
              this.setState({
                tabStatusUnloaded: !0
              }, {
                tabStatusUnloaded: !1
              }), void(this.waitActive = !1);
          } catch (e) {
            s.Log.notice("chrome tab fetch error", {
              error: u.Err.getMessage(e)
            });
          }
          const e = yield o.Async.timeoutPromiseWithoutTimeoutError(this.checkContentScriptReachable(), 10 * h.TIME.ONE_SECOND_MS, "checkContentScriptReachable");
          if (!this.waitActive || t !== this.waitId) return void s.Log.notice("wait for root element", {
            waitActive: this.waitActive,
            currentWaitId: this.waitId,
            expectedWaitId: t
          });
          if (e) return this.setState({
            rootElementFound: !0
          }, {}), void(this.waitActive = !1);
          yield o.Async.sleep(50);
        } while (!e.isTimedOut());
        this.setState({
          rootElementLookupTimedOut: !0
        }, {}), this.waitActive = !1;
      }));
    }
    checkContentScriptReachable() {
      return n(this, void 0, void 0, (function*() {
        const e = {
          method: "getRootElement"
        };
        try {
          return yield l.ChromeTab.sendMessage(this.sharedState.tab.tabId, e, !1), !0;
        } catch (e) {
          return !1;
        }
      }));
    }
  }
  t.WaitForRootElementEventListener = f;
},