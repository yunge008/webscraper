/**
 * Module: UniqueElementList
 * Source module ID: 94341
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

94341: function(e, t, r) {
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
  }), t.UniqueElementList = void 0;
  const i = r(789);
  t.UniqueElementList = class {
    constructor(e) {
      this.elementUniquenessType = e, this.addedElements = new Map, this.elements = [];
    }
    get length() {
      return this.elements.length;
    }
    push(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield this.getElementUniqueId(e);
        return !this.isAdded(t) && (this.addedElements.set(t, !0), this.elements.push(e),
          !0);
      }));
    }
    getElementUniqueId(e) {
      return n(this, void 0, void 0, (function*() {
        let t;
        if ("uniqueText" === this.elementUniquenessType) t = yield e.getText();
        else if ("uniqueHTMLText" === this.elementUniquenessType) t = yield e.getWrappedHTML();
        else if ("uniqueHTML" === this.elementUniquenessType) t = yield e.getWrappedHTMLWithoutText();
        else {
          if ("uniqueCSSSelector" !== this.elementUniquenessType) {
            throw `Invalid elementUniquenessType ${this.elementUniquenessType}`;
          }
          t = yield e.getCSSSelector();
        }
        return i.Str.getHash(t, "sha1");
      }));
    }
    isElementAdded(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield this.getElementUniqueId(e);
        return this.addedElements.has(t);
      }));
    }
    isAdded(e) {
      return this.addedElements.has(e);
    }
    getElements() {
      return this.elements;
    }
  };
},