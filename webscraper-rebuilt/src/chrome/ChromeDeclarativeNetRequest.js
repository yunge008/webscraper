/**
 * Module: ChromeDeclarativeNetRequest
 * Source module ID: 74465
 * Category: chrome
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

74465: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ChromeDeclarativeNetRequest = void 0;
  t.ChromeDeclarativeNetRequest = class {
    static updateDynamicRules(e) {
      return new Promise(((t, r) => {
        chrome.declarativeNetRequest.updateDynamicRules(e, (() => {
          chrome.runtime.lastError ? r(chrome.runtime.lastError) : t();
        }));
      }));
    }
    static updateSessionRules(e) {
      return new Promise(((t, r) => {
        chrome.declarativeNetRequest.updateSessionRules(e, (() => {
          chrome.runtime.lastError ? r(chrome.runtime.lastError) : t();
        }));
      }));
    }
  };
},