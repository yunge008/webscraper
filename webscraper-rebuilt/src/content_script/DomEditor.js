/**
 * Content Script Module: DomEditor
 * Source module ID: 53612
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

53612: (e, t) => {
    "use strict";
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.DomEditor = void 0;
    t.DomEditor = class {
      constructor(e) {
        this.elementReferences = e;
      }
      setElementStyle(e, t, n) {
        this.elementReferences.getElementByReference(e).setAttribute("style", `${t}: ${n}`);
      }
      createImgElement(e) {
        const t = document.createElement("img");
        try {
          t.setAttribute("style", "display: none;"), t.src = e, document.documentElement.appendChild(t);
        } finally {
          document.documentElement.removeChild(t);
        }
      }
    };
  },
  86027: function(e, t, n) {
    "use strict";
    var r = this && this.__awaiter || function(e, t, n, r) {
      return new(n || (n = Promise))((function(i, o) {
        function a(e) {
          try {
            l(r.next(e));
          } catch (e) {
            o(e);
          }
        }

        function s(e) {
          try {
            l(r.throw(e));
          } catch (e) {
            o(e);
          }
        }

        function l(e) {
          var t;
          e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n((function(e) {
            e(t);
          }))).then(a, s);
        }
        l((r = r.apply(e, t || [])).next());
      }));
    };
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.ElementReferences = void 0;
    const i = n(7294),
      o = n(74161);
    t.ElementReferences = class {
      constructor() {
        this.elementReferences = [], this.tamperedElements = [], this.wssBlacklistedElements = [],
          this.wssWhitelistSelectors = void 0;
      }
      getCSSSelector(e) {
        return r(this, void 0, void 0, (function*() {
          let t, n, r = this.getElementByReference(e);
          for (t = 1, n = r.previousElementSibling; null !== n; n = n.previousElementSibling,
            t++);
          let i = `${r.tagName.toLocaleLowerCase()}:nth-child(${t})`;
          for (; r.parentElement;) {
            r = r.parentElement;
            const e = r.tagName.toLocaleLowerCase();
            if ("body" === e || "html" === e) i = `${e}>${i}`;
            else {
              for (t = 1, n = r.previousElementSibling; null !== n; n = n.previousElementSibling,
                t++);
              i = `${e}:nth-child(${t})>${i}`;
            }
          }
          return i;
        }));
      }
      getElementReference(e) {
        let t = this.elementReferences.indexOf(e);
        return -1 === t && (t = this.elementReferences.push(e) - 1), t;
      }
      getElementByReference(e) {
        const t = this.elementReferences[e];
        if (void 0 === t) throw `ACCESSING_UNDEFINED_ELEMENT ${e} probably page was reloaded`;
        if (null === t) throw `ACCESSING_NULL_ELEMENT ${e} element doesn't exist`;
        if (!1 === t.isConnected && ("html" === t.tagName || "body" === t.tagName || "HTML" === t.tagName || "BODY" === t.tagName)) {
          const n = document.querySelector(t.tagName);
          return this.elementReferences[e] = n, n;
        }
        return t;
      }
      getElements(e, t) {
        return r(this, arguments, void 0, (function*(e, t, n = !0) {
          let r;
          if (null != t) {
            const n = this.getElementByReference(t);
            r = i.ElementQuery.find(e, n);
          } else r = i.ElementQuery.find(e);
          const o = [];
          let a;
          n && this.wssWhitelistSelectors && (a = yield this.findElements(this.wssWhitelistSelectors));
          for (const t of r) o.push(this.getElementReference(t)), this.checkForTamperedElement(t),
            this.checkForWssBlacklistedElement(t), a && this.checkForWssWhitelistedElement(a, t, e);
          return o;
        }));
      }
      getClone(e) {
        return r(this, void 0, void 0, (function*() {
          const t = this.getElementByReference(e),
            n = t.cloneNode(!0);
          let r, i;
          if ("SELECT" === t.tagName ? (r = [t], i = [n]) : (r = t.querySelectorAll("select"),
              i = n.querySelectorAll("select")), r.length > 0)
            for (let e = 0; e < r.length; e++)
              for (let t = 0; t < r[e].options.length; t++) i[e].options[t].selected = r[e].options[t].selected;
          return this.getElementReference(n);
        }));
      }
      getRootElement() {
        return r(this, void 0, void 0, (function*() {
          return this.getElementReference(document);
        }));
      }
      getElement(e, t) {
        return r(this, void 0, void 0, (function*() {
          const n = yield this.getElements(e, t);
          return 0 === n.length ? null : n[0];
        }));
      }
      findTamperedElements(e) {
        return r(this, void 0, void 0, (function*() {
          this.tamperedElements = yield this.findElements(e);
        }));
      }
      clearTamperedElements() {
        this.tamperedElements = [];
      }
      findWssBlacklistedElements(e) {
        return r(this, void 0, void 0, (function*() {
          this.wssBlacklistedElements = yield this.findElements(e);
        }));
      }
      clearWssBlacklistedElements() {
        this.wssBlacklistedElements = [];
      }
      setWssWhitelistSelectors(e) {
        this.wssWhitelistSelectors = e;
      }
      clearWssWhitelistSelectors() {
        this.wssWhitelistSelectors = void 0;
      }
      checkForTamperedElement(e) {
        const t = this.getRelatedParentElementId(e, this.tamperedElements);
        if (t) throw new Error(`ACCESSING_TAMPERED_ELEMENT ${t}`);
      }
      checkForWssBlacklistedElement(e) {
        const t = this.getRelatedParentElementId(e, this.wssBlacklistedElements);
        if (t) throw new Error(`WEBSITE_STATE_SETUP_NOT_ALLOWED_FOR_THIS_ELEMENT ${t}`);
      }
      checkForWssWhitelistedElement(e, t, n) {
        this.getRelatedParentElementId(t, e) || o.Log.notice(`Unclassified website state setup element: ${n}`);
      }
      getRelatedParentElementId(e, t) {
        for (const n of t)
          if (n.element.contains(e)) return n.id;
      }
      findElements(e) {
        return r(this, void 0, void 0, (function*() {
          const t = [];
          for (const n of e) {
            const e = yield this.getElements(n.selector, void 0, !1);
            for (const r of e) t.push({
              element: this.getElementByReference(r),
              id: n.id
            });
          }
          return t;
        }));
      }
    };
  },
  30460: function(e, t, n) {
    "use strict";
    var r = this && this.__awaiter || function(e, t, n, r) {
      return new(n || (n = Promise))((function(i, o) {
        function a(e) {
          try {
            l(r.next(e));
          } catch (e) {
            o(e);
          }
        }

        function s(e) {
          try {
            l(r.throw(e));
          } catch (e) {
            o(e);
          }
        }

        function l(e) {
          var t;
          e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n((function(e) {
            e(t);
          }))).then(a, s);
        }
        l((r = r.apply(e, t || [])).next());
      }));
    };
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.AllAttributeExtractor = void 0;
    const i = n(3602),
      o = n(6469);
    class a extends i.ExtractorBase {
      parseAttributes(e) {
        const t = {};
        for (const n of e) t[o.UnicodeFixer.fix(n.name)] = o.UnicodeFixer.fix(n.value);
        return t;
      }
      extract(e) {
        return r(this, void 0, void 0, (function*() {
          const t = this.elementReferences.getElementByReference(e);
          if (t instanceof Document) return {};
          const n = t.attributes;
          return this.parseAttributes(n);
        }));
      }
    }
    t.AllAttributeExtractor = a;
  },
  38019: function(e, t, n) {
    "use strict";
    var r = this && this.__awaiter || function(e, t, n, r) {
      return new(n || (n = Promise))((function(i, o) {
        function a(e) {
          try {
            l(r.next(e));
          } catch (e) {
            o(e);
          }
        }

        function s(e) {
          try {
            l(r.throw(e));
          } catch (e) {
            o(e);
          }
        }

        function l(e) {
          var t;
          e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n((function(e) {
            e(t);
          }))).then(a, s);
        }
        l((r = r.apply(e, t || [])).next());
      }));
    };
    Object.defineProperty(t, "__esModule", {
      value: !0
    }), t.AttributeExtractor = void 0;
    const i = n(3602),
      o = n(6469);
    class a extends i.ExtractorBase {
      extract(e, t, n) {
        return r(this, void 0, void 0, (function*() {
          const r = this.elementReferences.getElementByReference(e);
          return r instanceof Document ? null : (n && r.classList.add("-sitemap-parent"),
            o.UnicodeFixer.fix(r.getAttribute(t)));
        }));
      }
    }
    t.AttributeExtractor = a;
  },