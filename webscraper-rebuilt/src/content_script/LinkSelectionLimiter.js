/**
 * Content Script Module: LinkSelectionLimiter
 * Source module ID: 76682
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

76682: (e, t, n) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.LinkSelectionLimiter = void 0;
  const r = n(30460),
    i = n(3791),
    o = n(51762),
    a = n(78171),
    s = n(49766),
    l = n(90195);
  class c extends s.SelectionLimiter {
    constructor() {
      super(), this.linksFromTextExtractor = new a.LinksFromTextExtractor, this.linkFromAttributesExtractor = new i.LinkFromAttributesExtractor,
        this.linkFromInlineScriptExtractor = new o.LinkFromInlineScriptExtractor, this.allAttributeExtractor = new r.AllAttributeExtractor(void 0);
    }
    elementCanBeSelected(e) {
      return this.extractAsLinkFromHref(e) ? (this.extractedLinkType = "linkFromHref",
        !0) : this.extractAsInlineScript(e) ? (this.extractedLinkType = "linkFromInlineScript",
        !0) : this.extractAsLinkFromAttributes(e) ? (this.extractedLinkType = "linkFromAttributes",
        !0) : !!this.extractAsLinkFromInnerText(e) && (this.extractedLinkType = "linkFromInnerText",
        !0);
    }
    extractAsLinkFromHref(e) {
      if (!this.elementTagsAllowed(e, ["a", "area"])) return !1;
      const t = e.getAttribute("href");
      return !(!t || !l.Url.isRecognizedProtocol(t)) || void 0;
    }
    extractAsInlineScript(e) {
      const t = e.getAttribute("href"),
        n = e.getAttribute("onclick");
      return !!this.linkFromInlineScriptExtractor.getMatchingData(t, n);
    }
    extractAsLinkFromAttributes(e) {
      const t = e.tagName.toLowerCase(),
        n = this.allAttributeExtractor.parseAttributes(e.attributes);
      return !!this.linkFromAttributesExtractor.extract(t, n);
    }
    extractAsLinkFromInnerText(e) {
      for (const t of e.childNodes) {
        if ("#text" !== t.nodeName) continue;
        const e = t.textContent.trim();
        if (this.linksFromTextExtractor.extract(e).length) return !0;
      }
      return !1;
    }
  }
  t.LinkSelectionLimiter = c;
},