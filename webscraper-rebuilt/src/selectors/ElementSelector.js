/**
 * Module: ElementSelector
 * Source module ID: 39976
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

39976: (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ElementSelector = void 0;
  const n = r(7294),
    i = r(9712),
    o = r(2930),
    s = r(1314),
    a = r(35385),
    l = ["itemscope", "itemtype", "itemprop", "role"],
    c = ["data-testid", "data-automation-id", "data-cy", "data-qa", "ng-model", "data-component"],
    u = {
      rel: ["next", "prev"]
    },
    d = ["data-testid", "data-automation-id", "data-cy", "data-qa"],
    h = ["class", "id", "href", "src", "srcset", "content", "style", "rel", "xmlns", "data-ws-style", "alt", "title", "aria-label", "data-active"],
    f = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "+", "=", "[", "]", "{", "}", ";", '"', "'", "<", ">", "?", "/", "|", "\\", "~", "`", '\\"', "\\'", " "],
    p = ['"', "\\", "'", "~", ">", "<", "+", "\n", "\r", "\f", "(", ")", "[", "]"];
  class m {
    constructor(e, t, r) {
      if (this.showTag = !0, this.enableSmartTableSelector = r, this.element = e, this.isDirectChild = !0,
        this.tag = e.localName, this.tag = this.tag.replace(/:/g, "\\:"), m.isInvalidTagName(this.tag) && (this.tag = ""),
        this.isShadowRoot = !!n.ElementQuery.getShadowRoot(e), this.index = 1, this.classes = new Set,
        this.generatedClasses = new Set, this.schemaOrgAttributes = new Set, this.betterThanClassesAttributes = new Set,
        this.attributes = new Set, "html" === this.tag || "HTML" === this.tag || "body" === this.tag || "BODY" === this.tag) return void(this.index = void 0);
      if (void 0 !== e.parentNode)
        for (let t = 0; t < e.parentNode.children.length; t++) {
          const r = e.parentNode.children[t];
          if (r.nodeType === a.HTMLElementNode.ELEMENT_NODE) {
            if (r === e) break;
            r.tagName === e.tagName && this.index++;
          }
        }
      "" !== e.id && isNaN(parseInt(e.id, 10)) && !m.isInvalidIdName(e.id) && (this.id = e.id);
      const o = new s.CssClassAnalyzer;
      for (let r = e.classList.length - 1; r >= 0; r--) {
        const n = e.classList[r];
        t.includes(n) || (m.isInvalidClassName(n) || (o.isGenerated(n) ? this.generatedClasses.add(n) : this.classes.add(n)));
      }
      for (const t of l)
        if (e.hasAttribute(t)) {
          const r = e.getAttribute(t);
          r && !m.isIgnoredAttributeValue(r) ? this.schemaOrgAttributes.add(`[${t}='${r}']`) : this.schemaOrgAttributes.add(`[${t}]`);
        }
      for (const t of c)
        if (e.hasAttribute(t)) {
          this.betterThanClassesAttributes.add(`[${t}]`);
          const r = e.getAttribute(t);
          if (r) {
            if (d.includes(t)) {
              const e = r.split("-");
              if (e.length > 1) {
                const r = e[0];
                r && !m.isIgnoredAttributeValue(r) && this.betterThanClassesAttributes.add(`[${t}^='${r}-']`);
              }
            }
            m.isIgnoredAttributeValue(r) || this.betterThanClassesAttributes.add(`[${t}='${r}']`);
          }
        }
      for (const t in u) {
        const r = u[t],
          n = e.getAttribute(t);
        n && r.includes(n) && this.betterThanClassesAttributes.add(`[${t}='${n}']`);
      }
      if ("function" == typeof e.getAttributeNames)
        for (const t of e.getAttributeNames().reverse()) {
          if (m.isIgnoredAttributeName(t, !0)) continue;
          if (m.isInvalidAttributeName(t)) continue;
          const r = this.escapeAttributeName(t),
            n = e.getAttribute(t);
          n && !m.isIgnoredAttributeValue(n) && this.attributes.add(`[${r}='${n}']`), this.attributes.add(`[${r}]`);
        }
      if (this.element.previousElementSibling) {
        const e = this.element.previousElementSibling;
        if ("DT" === e.tagName) {
          const t = e.tagName.toLowerCase(),
            r = e.textContent;
          if (m.isValidContainsText(r)) {
            const e = `${t}${i.CSSSelectorHelper.getContainsSelectorStr(r)}`;
            this.previousSiblingText = e;
          }
        }
      }
      if (this.enableSmartTableSelector && "TD" === this.element.tagName && this.element.previousElementSibling) {
        const e = this.element.previousElementSibling;
        let t = 0;
        for (const e of this.element.parentElement.children) e.nodeType === a.HTMLElementNode.ELEMENT_NODE && t++;
        if (2 === t && this.element.previousElementSibling && ("TH" === e.tagName || "TD" === e.tagName)) {
          const t = e.tagName.toLowerCase(),
            r = e.textContent;
          if (m.isValidContainsText(r)) {
            const e = `${t}${i.CSSSelectorHelper.getContainsSelectorStr(r)}`;
            this.previousSiblingText = e;
          }
        }
      }
    }
    static isIgnoredAttributeName(e, t) {
      if (h.includes(e)) return !0;
      if (t) {
        if (l.includes(e)) return !0;
        if (c.includes(e)) return !0;
      }
      for (const t of f)
        if (e.includes(t)) return !0;
      for (const t of ["-", "."])
        if (e.startsWith(t)) return !0;
      return !1;
    }
    static isInvalidAttributeName(e) {
      return !e.match(/^[a-zA-Z_][a-zA-Z0-9_.-]*$/);
    }
    static isInvalidClassName(e) {
      return !e.match(/^[a-zA-Z_][a-zA-Z0-9_-]*$/);
    }
    static isInvalidIdName(e) {
      return "string" != typeof e || !e.match(/^[a-zA-Z_][a-zA-Z0-9_-]*$/);
    }
    static isInvalidTagName(e) {
      return !e.match(/^[\w:\\_-]+$/i);
    }
    static isValidContainsText(e) {
      return 0 !== e.trim().length && !e.match(/[()]/);
    }
    static isIgnoredAttributeValue(e) {
      for (const t of p)
        if (e.includes(t)) return !0;
      return !1;
    }
    getCssSelector(e) {
      let t = "";
      (this.showTag || this.isDirectChild || void 0 !== this.index || this.previousSiblingText || this.isShadowRoot) && (t = this.tag),
      this.id && !this.id.startsWith("\\[object") && (t += `#${this.id}`);
      for (const e of this.generatedClasses) t += `.${e}`;
      for (const e of this.classes) t += `.${e}`;
      for (const e of this.schemaOrgAttributes) t += e;
      for (const e of this.betterThanClassesAttributes) t += e;
      for (const e of this.attributes) t += e;
      return void 0 !== this.index && (t += `:nth-of-type(${this.index})`), this.previousSiblingText && (t = `${this.previousSiblingText} + ${t}`),
        t.trim().length > 0 && this.isDirectChild && !e && (t = `> ${t}`), this.isShadowRoot && (t += ":shadow-root"),
        t;
    }
    merge(e) {
      if (this.tag !== e.tag) throw "different element selected (tag)";
      void 0 !== this.index && this.index !== e.index && (this.index = void 0), !0 === this.isDirectChild && (this.isDirectChild = e.isDirectChild),
        void 0 !== this.id && this.id !== e.id && (this.id = void 0), this.classes = o.SetHelper.intersection(this.classes, e.classes),
        this.generatedClasses = o.SetHelper.intersection(this.generatedClasses, e.generatedClasses),
        this.attributes = o.SetHelper.intersection(this.attributes, e.attributes), this.schemaOrgAttributes = o.SetHelper.intersection(this.schemaOrgAttributes, e.schemaOrgAttributes),
        this.betterThanClassesAttributes = o.SetHelper.intersection(this.betterThanClassesAttributes, e.betterThanClassesAttributes),
        this.previousSiblingText && this.previousSiblingText !== e.previousSiblingText && (this.previousSiblingText = void 0);
    }
    escapeAttributeName(e) {
      return e = e.replace(/([:.])/g, "\\$1");
    }
  }
  t.ElementSelector = m;
},