/**
 * Content Script Module: NumpadCodes
 * Source module ID: 6525
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

6525: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.NumpadCodes = void 0, t.NumpadCodes = {
    "-": {
      code: "NumpadSubtract",
      windowsVirtualKeyCode: 109,
      isKeypad: !0,
      location: 1
    },
    "/": {
      code: "NumpadDivide",
      windowsVirtualKeyCode: 111,
      isKeypad: !0,
      location: 1
    },
    "*": {
      code: "NumpadMultiply",
      windowsVirtualKeyCode: 106,
      isKeypad: !0,
      location: 1
    },
    "+": {
      code: "NumpadAdd",
      windowsVirtualKeyCode: 107,
      isKeypad: !0,
      location: 1
    }
  };
},