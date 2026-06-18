/**
 * Content Script Module: PointerEventOptions
 * Source module ID: 82190
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

82190: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.PointerEventOptions = void 0;
  t.PointerEventOptions = class {
    static pointerrawupdate() {
      return {
        bubbles: !0,
        cancelable: !1,
        composed: !0,
        detail: 0,
        view: window,
        button: -1,
        buttons: 0,
        movementX: 0,
        movementY: -1,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: !0
      };
    }
    static pointerover() {
      return {
        bubbles: !0,
        cancelable: !0,
        composed: !0,
        view: window,
        button: -1,
        buttons: 0,
        movementX: 0,
        movementY: 0,
        relatedTarget: document.body,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: !0
      };
    }
    static pointerenter() {
      return {
        composed: !1,
        view: window,
        button: -1,
        relatedTarget: document.body,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: !0
      };
    }
    static pointermove() {
      return {
        bubbles: !0,
        cancelable: !0,
        composed: !0,
        view: window,
        button: -1,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: !0
      };
    }
    static pointerdown() {
      return {
        bubbles: !0,
        cancelable: !0,
        composed: !0,
        view: window,
        buttons: 1,
        pointerId: 1,
        pressure: .5,
        pointerType: "mouse",
        isPrimary: !0
      };
    }
    static pointerup() {
      return {
        bubbles: !0,
        cancelable: !0,
        composed: !0,
        view: window,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: !0
      };
    }
    static click() {
      return {
        bubbles: !0,
        cancelable: !0,
        composed: !0,
        detail: 1,
        view: window,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: !1
      };
    }
  };
},