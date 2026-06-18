/**
 * Module: LockEventListener
 * Source module ID: 98764
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

98764: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.LockEventListener = void 0;
  const n = r(15524);
  class i extends n.BaseWebNavigationEventListener {
    get isPageLoadComplete() {
      return !this.state.locked;
    }
    get pageLoadError() {}
    deInitListeners() {}
    initListeners() {}
    lock() {
      this.setState({
        locked: !0
      }, {
        locked: !1
      });
    }
    unlock() {
      this.setState({
        locked: !1
      }, {
        locked: !0
      });
    }
    setAlreadyLoaded() {
      throw new Error("Currently not intended to call setAlreadyLoaded on MinDurationEventListener");
    }
    isLocked() {
      return this.state.locked;
    }
    resetState() {
      this.state = {
        locked: !1
      };
    }
    initTimeouts() {}
  }
  t.LockEventListener = i;
},