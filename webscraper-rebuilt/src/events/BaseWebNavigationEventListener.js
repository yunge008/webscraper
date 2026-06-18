/**
 * Module: BaseWebNavigationEventListener
 * Source module ID: 15524
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

15524: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.BaseWebNavigationEventListener = void 0;
  const n = r(74161),
    i = r(24567);
  t.BaseWebNavigationEventListener = class {
    constructor(e) {
      this.sharedState = e.sharedState, this.onRedirect = e.onRedirect, this.onPageLoadDelayShouldBeReset = e.onPageLoadDelayShouldBeReset,
        this.onStateChanged = e.onStateChanged, this.timeouts = {};
    }
    reset() {
      this.resetState(), this.clearTimeouts(), this.initTimeouts();
    }
    clearTimeouts() {
      for (const e in this.timeouts) clearTimeout(this.timeouts[e]), this.timeouts[e] = void 0;
    }
    assertState(e, t) {
      i.Obj.empty(i.Obj.diffWouldUpdate(this.state, t)) || n.Log.notice(`Unexpected state values. should be: ${JSON.stringify(t)} was: ${JSON.stringify(this.state)}`, {
        event: e
      });
    }
    setState(e, t) {
      this.sharedState.waitForStatusActive || n.Log.notice(`Received set state event after tab load complete ${JSON.stringify(e)}`, {
          hideInEsLogs: !0
        }), i.Obj.empty(i.Obj.diffWouldNotUpdate(this.state, e)) || n.Log.notice(`unset state: ${JSON.stringify(i.Obj.diffWouldNotUpdate(this.state, e))} current: ${JSON.stringify(this.state)}`, {}),
        this.assertState("setState", t), this.overrideState(e), this.sharedState.waitForStatusActive && this.onStateChanged();
    }
    clearTimeout(e) {
      clearTimeout(this.timeouts[e]), this.timeouts[e] = void 0;
    }
    isChromeExtensionUrl() {
      return !!this.sharedState.url.match(/^chrome-extension:\/\//);
    }
    overrideState(e) {
      this.state = Object.assign(Object.assign({}, this.state), e);
    }
  };
},