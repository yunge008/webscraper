/**
 * Module: FailOnErrorPagesEventListener
 * Source module ID: 86712
 * Category: events
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

86712: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.FailOnErrorPagesEventListener = void 0;
  const n = r(15524),
    i = r(31376),
    o = r(43092);
  class s extends n.BaseWebNavigationEventListener {
    constructor(e) {
      super(e), this.webNavigationEventListener = e.webNavigationEventListener, this.waitForListeners = e.waitForListeners,
        this.webRequestEventListener = e.webRequestEventListener;
    }
    get isPageLoadComplete() {
      return !!this.hasPageLoadBeenStopped() || !(!this.haveOtherListenersCompleted() || void 0 !== this.pageLoadError);
    }
    get pageLoadError() {
      if (this.haveOtherListenersCompleted()) return "net::ERR_HTTP_RESPONSE_CODE_FAILURE" === this.webNavigationEventListener.state.wnError ? `PAGE_STATUS_CODE_ERROR ${this.webRequestEventListener.state.headersStatusCode}` : i.ContentTypeParser.isContentTypeUnknown(this.webRequestEventListener.state.headersContentType) ? "PAGE_UNKNOWN_CONTENT_TYPE_ERROR" : void 0;
    }
    deInitListeners() {}
    initListeners() {}
    setAlreadyLoaded() {
      throw new Error("Currently not intended to call setAlreadyLoaded on FailOnErrorPagesEventListener");
    }
    initTimeouts() {}
    resetState() {}
    haveOtherListenersCompleted() {
      for (const e of this.waitForListeners)
        if (void 0 === e.pageLoadError && !e.isPageLoadComplete) return !1;
      return !0;
    }
    hasPageLoadBeenStopped() {
      for (const e of this.waitForListeners)
        if (e instanceof o.TabEventListener) {
          if (e.pageLoadError || e.isPageLoadComplete) return !1;
        } else if (void 0 === e.pageLoadError && !e.isPageLoadComplete) return !1;
      return "WEB_NAVIGATION_ERROR net::ERR_ABORTED" === this.webNavigationEventListener.pageLoadError && "PAGE_REQUEST_ERROR net::ERR_ABORTED" === this.webRequestEventListener.pageLoadError;
    }
  }
  t.FailOnErrorPagesEventListener = s;
},