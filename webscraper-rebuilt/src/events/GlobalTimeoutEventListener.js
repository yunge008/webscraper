/**
 * Module: GlobalTimeoutEventListener
 * Source module ID: 44479
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

44479: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.GlobalTimeoutEventListener = void 0;
  const n = r(15524),
    i = r(74161),
    o = r(88374);
  class s extends n.BaseWebNavigationEventListener {
    constructor() {
      super(...arguments), this.globalTimeout = o.PAGE_LOAD_TIMEOUT.GLOBAL_PAGE_LOAD_TIMEOUT;
    }
    get isPageLoadComplete() {
      return !0;
    }
    get pageLoadError() {
      if (this.state.globalTimeoutCompleted) return "PAGE_LOAD_TIMEOUT";
    }
    deInitListeners() {}
    initListeners() {}
    setAlreadyLoaded() {
      throw new Error("Currently not intended to call setAlreadyLoaded on GlobalTimeoutEventListener");
    }
    resetState() {
      this.state = {
        globalTimeoutCompleted: !1
      };
    }
    initTimeouts() {
      this.initGlobalTimeout();
    }
    initGlobalTimeout() {
      if (this.timeouts.globalTimeout) throw new Error("global timeout already initialized");
      this.timeouts.globalTimeout = setTimeout((() => {
        this.clearTimeout("globalTimeout"), i.Log.notice("Global timeout completed", {
          url: this.sharedState.url,
          state: JSON.stringify(this.state),
          event: "globalTimeout"
        }), this.setState({
          globalTimeoutCompleted: !0
        }, {});
      }), this.globalTimeout);
    }
  }
  t.GlobalTimeoutEventListener = s;
},