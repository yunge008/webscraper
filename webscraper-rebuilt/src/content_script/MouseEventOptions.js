/**
 * Content Script Module: MouseEventOptions
 * Source module ID: 36912
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

36912: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.MouseEventOptions = void 0;
  t.MouseEventOptions = class {
    static mouseover() {
      return {
        bubbles: !0,
        cancelable: !0,
        composed: !0,
        view: window,
        button: -1,
        buttons: 0,
        movementX: 0,
        movementY: -1,
        relatedTarget: document.body
      };
    }
    static mouseenter() {
      return {
        composed: !1,
        view: window,
        button: -1,
        buttons: 0,
        movementX: 0,
        movementY: -1,
        relatedTarget: document.body
      };
    }
    static mousemove() {
      return {
        bubbles: !0,
        cancelable: !0,
        composed: !0,
        view: window,
        button: -1,
        buttons: 0,
        movementX: 0,
        movementY: -1
      };
    }
    static mousedown() {
      return {
        bubbles: !0,
        cancelable: !0,
        composed: !0,
        detail: 1,
        view: window,
        buttons: 1
      };
    }
    static mouseup() {
      return {
        bubbles: !0,
        cancelable: !0,
        composed: !0,
        detail: 1,
        view: window,
        buttons: 0
      };
    }
  };
},