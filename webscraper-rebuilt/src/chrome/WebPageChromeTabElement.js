/**
 * Module: WebPageChromeTabElement
 * Source module ID: 18211
 * Category: chrome
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

18211: function(e, t, r) {
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
  }), t.WebPageChromeTabElement = void 0;
  const i = r(94606);
  class o {
    constructor(e, t) {
      this.element = e, this.chromeClient = t;
    }
    isJsDisabled() {
      return this.chromeClient.isJsDisabled();
    }
    getElements(e) {
      return n(this, arguments, void 0, (function*(e, t = 0) {
        return (yield this.chromeClient.getElements(e, this.element, t)).map((e => new o(e, this.chromeClient)));
      }));
    }
    getElement(e) {
      return n(this, arguments, void 0, (function*(e, t = 0) {
        const r = yield this.chromeClient.getElement(e, this.element, t);
        return null === r ? r : new o(r, this.chromeClient);
      }));
    }
    getParentElement(e, t) {
      return n(this, void 0, void 0, (function*() {
        const r = t[t.length - 1];
        if ("_root" === r) return this;
        const n = e.getSelectorById(r);
        if (n.willReturnElements()) {
          return (yield this.getParentElement(e, t.slice(0, -1))).getElement(n.selector);
        }
        return this;
      }));
    }
    getText() {
      return n(this, void 0, void 0, (function*() {
        return yield this.chromeClient.getText(this.element);
      }));
    }
    getAllAttributes() {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.getAllAttributes(this.element);
      }));
    }
    getProp(e) {
      return n(this, void 0, void 0, (function*() {
        return yield this.chromeClient.getProp(this.element, e);
      }));
    }
    getAttr(e) {
      return n(this, void 0, void 0, (function*() {
        return yield this.chromeClient.getAttr(this.element, e);
      }));
    }
    getHTML() {
      return n(this, void 0, void 0, (function*() {
        return yield this.chromeClient.getHTML(this.element);
      }));
    }
    getClone() {
      return n(this, void 0, void 0, (function*() {
        const e = yield this.chromeClient.getClone(this.element);
        return new o(e, this.chromeClient);
      }));
    }
    getWrappedHTML() {
      return n(this, void 0, void 0, (function*() {
        return yield this.chromeClient.getWrappedHTML(this.element);
      }));
    }
    getWrappedHTMLWithoutText() {
      return n(this, void 0, void 0, (function*() {
        return yield this.chromeClient.getWrappedHTMLWithoutText(this.element);
      }));
    }
    getCSSSelector() {
      return n(this, void 0, void 0, (function*() {
        return yield this.chromeClient.getCSSSelector(this.element);
      }));
    }
    scrollDownElement(e, t) {
      return n(this, arguments, void 0, (function*(e, t, r = !1, n) {
        yield this.chromeClient.scrollDownElement(e, t, r, n);
      }));
    }
    scrollDownBody(e, t) {
      return n(this, arguments, void 0, (function*(e, t, r = !1) {
        yield this.chromeClient.scrollDownBody(e, t, r);
      }));
    }
    scrollDownViewport(e) {
      return n(this, arguments, void 0, (function*(e, t = !1) {
        yield this.chromeClient.scrollDownViewport(e, t);
      }));
    }
    scrollViewportToTop(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.chromeClient.scrollViewportToTop(e);
      }));
    }
    isWrapperOneViewportFromBottom(e) {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.isWrapperOneViewportFromBottom(e);
      }));
    }
    getWrapperPosition(e) {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.getWrapperPosition(e);
      }));
    }
    srcollBodyToTop() {
      return n(this, void 0, void 0, (function*() {
        yield this.chromeClient.srcollBodyToTop();
      }));
    }
    scrollElementToTop(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.chromeClient.scrollElementToTop(e);
      }));
    }
    scrollViewportToBottom(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.chromeClient.scrollViewportToBottom(e);
      }));
    }
    getPopupURL() {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.getPopupURL(this.element);
      }));
    }
    click() {
      return n(this, arguments, void 0, (function*(e = i.ClickActionTypes.auto) {
        yield this.chromeClient.click(this.element, e);
      }));
    }
    type(e) {
      return n(this, void 0, void 0, (function*() {
        yield this.chromeClient.type(this.element, e);
      }));
    }
    downloadUrl(e) {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.downloadUrl(e);
      }));
    }
    getPageUrl() {
      return n(this, void 0, void 0, (function*() {
        return yield this.chromeClient.getPageUrl();
      }));
    }
    getRedirectLink() {
      return n(this, void 0, void 0, (function*() {
        return yield this.chromeClient.getRedirectLink(this.element);
      }));
    }
    getTagName() {
      return n(this, void 0, void 0, (function*() {
        return yield this.chromeClient.getTagName(this.element);
      }));
    }
    getDataWithScript(e) {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.getDataWithScript(this.element, e);
      }));
    }
    waitForPageLoadComplete(e) {
      return n(this, arguments, void 0, (function*(e, t = !1) {
        yield this.chromeClient.waitForPageLoadComplete(e, t);
      }));
    }
    findScrollableParentElement(e) {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.findScrollableParentElement(this.element, e);
      }));
    }
    getDocumentScrollingElementReference() {
      return n(this, void 0, void 0, (function*() {
        return this.chromeClient.getDocumentScrollingElementReference();
      }));
    }
  }
  t.WebPageChromeTabElement = o;
},