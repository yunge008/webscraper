/**
 * Module: MinDurationEventListener
 * Source module ID: 72353
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

72353: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.MinDurationEventListener = void 0;
  const n = r(15524);
  class i extends n.BaseWebNavigationEventListener {
    get isPageLoadComplete() {
      return this.state.minDurationCompleted;
    }
    get pageLoadError() {}
    deInitListeners() {}
    initListeners() {}
    setAlreadyLoaded() {
      throw new Error("Currently not intended to call setAlreadyLoaded on MinDurationEventListener");
    }
    resetState() {
      this.state = {
        minDurationCompleted: !1
      };
    }
    initTimeouts() {
      this.initDurationTimeout();
    }
    initDurationTimeout() {
      this.clearTimeout("durationTimeout"), this.timeouts.durationTimeout = setTimeout((() => {
        this.clearTimeout("durationTimeout"), this.setState({
          minDurationCompleted: !0
        }, {
          minDurationCompleted: !1
        });
      }), this.sharedState.minDuration);
    }
  }
  t.MinDurationEventListener = i;
},