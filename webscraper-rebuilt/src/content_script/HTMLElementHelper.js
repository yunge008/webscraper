/**
 * Content Script Module: HTMLElementHelper
 * Source module ID: 94861
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

94861: (e, t, n) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.HTMLElementHelper = void 0;
  const r = n(35385);
  class i {
    static getElementIndex(e) {
      let t = 0;
      for (; e = e.previousSibling;) e.nodeType !== r.HTMLElementNode.TEXT_NODE && t++;
      return t;
    }
    static isTextNode(e) {
      return e.nodeType === r.HTMLElementNode.TEXT_NODE;
    }
    static hasTextContents(e) {
      for (const t of e.childNodes)
        if (i.isTextNode(t) && t.textContent.trim().length) return !0;
      return !1;
    }
    static getCssSelector(e) {
      const t = [];
      for (; e.nodeType === r.HTMLElementNode.ELEMENT_NODE;) {
        let n = `${e.nodeName.toLowerCase()}`;
        for (const t of e.classList) n += `.${t}`;
        n += `:nth-child(${i.getElementIndex(e)})`, t.unshift(n), e = e.parentNode;
      }
      return t.join(" > ");
    }
    static getTagPathCssSelector(e) {
      let t = e,
        n = "";
      do {
        n = `>${t.tagName.toLowerCase()}${n}`, t = t.parentElement;
      } while (t && t.tagName);
      return n;
    }
    static getTagName(e) {
      return e.tagName.toUpperCase();
    }
    static isImage(e) {
      var t;
      return "img" === e.tagName.toLowerCase() && !!(null === (t = e.getAttribute("src")) || void 0 === t ? void 0 : t.trim());
    }
    static parentsContainElement(e, t) {
      for (const n of e)
        if (n.contains(t)) return !0;
      return !1;
    }
  }
  t.HTMLElementHelper = i;
},