/**
 * Module: PageLoadDelayEventListener
 * Source module ID: 27695
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

27695: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.PageLoadDelayEventListener = void 0;
  const n = r(15524);
  class i extends n.BaseWebNavigationEventListener {
    get isPageLoadComplete() {
      return this.state.pageLoadDelayCompleted;
    }
    get pageLoadError() {}
    deInitListeners() {}
    initListeners() {}
    setAlreadyLoaded() {
      throw new Error("Currently not intended to call setAlreadyLoaded on PageLoadDelayEventListener");
    }
    resetState() {
      this.state = {
        pageLoadDelayCompleted: !1
      };
    }
    initTimeouts() {
      this.initPageLoadDelayCompletedTimeout();
    }
    initPageLoadDelayCompletedTimeout() {
      this.clearTimeout("pageLoadDelayTimeout"), this.state.pageLoadDelayCompleted = !1,
        this.timeouts.pageLoadDelayTimeout = setTimeout((() => {
          this.clearTimeout("pageLoadDelayTimeout"), this.setState({
            pageLoadDelayCompleted: !0
          }, {
            pageLoadDelayCompleted: !1
          });
        }), this.sharedState.pageLoadDelay);
    }
  }
  t.PageLoadDelayEventListener = i;
},