/**
 * Content Script Module: Selection
 * Source module ID: 71053
 * Extracted from: content_script.js (Web Scraper v1.107.22)
 * Runs in: page context (injected into target websites)
 */

71053: (e, t, n) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Selection = void 0;
  const r = n(31507),
    i = n(32949),
    o = n(7294),
    a = n(76682),
    s = n(14288),
    l = n(94861);
  t.Selection = class {
    constructor(e, t) {
      this.selector = "", this.clickedElements = new Set, this.selectedElements = new Set,
        this.selectionLevel = 0, this.elementPreviewClassname = "-ws-data-preview-element",
        this.parentElements = e, this.selectionLimiter = t, this.cssSelector = new r.CssSelector({
          enableSmartTableSelector: !0,
          parent: e,
          ignoredClasses: [this.elementPreviewClassname],
          query: e => (e = s.SelectorOptimizer.optimize(e), o.ElementQuery.findMultipleParents(e, this.parentElements))
        });
    }
    traverseDom(e) {
      if (this.cssSelector.getElementGroups(this.getSelectedElements()).length > 1) throw new i.SelectionError("Can't traverse multiple groups");
      this.updateSelected(!0, e);
    }
    addClickedElement(e, t) {
      if (this.assertElement(e, t), this.canAddElement(e)) {
        if (this.clickedElements.add(e), this.selectionLimiter instanceof a.LinkSelectionLimiter) {
          const e = this.selectionLimiter.extractedLinkType;
          e && (this.linkType = e);
        }
      } else this.clickedElements.delete(e);
      this.updateSelected(t, 0);
    }
    reset() {
      this.selector = "", this.clickedElements.clear(), this.selectedElements.clear(),
        this.selectionLevel = 0;
    }
    getSelectedElements() {
      return Array.from(this.selectedElements);
    }
    getSelector() {
      return this.selector;
    }
    setSelector(e) {
      this.selector = e, e ? this.setSelectedElements(o.ElementQuery.findMultipleParents(e, this.parentElements)) : this.setSelectedElements([]);
    }
    canSelect(e) {
      const t = this.parentElements.includes(e),
        n = l.HTMLElementHelper.parentsContainElement(this.parentElements, e),
        r = e.getRootNode();
      return t || n || r instanceof ShadowRoot && l.HTMLElementHelper.parentsContainElement(this.parentElements, r.host);
    }
    onElementsSelected(e) {
      this.onElementsSelectedCallback = e;
    }
    updateSelected(e, t) {
      if (this.clickedElements.size > 0) {
        const n = this.selectionLevel + t;
        if (n < 0) return;
        const r = this.cssSelector.getCssSelector(Array.from(this.clickedElements), n, e);
        this.setSelector(r), this.selectionLevel = n;
      } else this.selectionLevel = 0, this.setSelector("");
      this.onElementsSelectedCallback && this.onElementsSelectedCallback(this.selectedElements.size);
    }
    canAddElement(e) {
      return !this.clickedElements.has(e) && !this.selectedElements.has(e);
    }
    assertElement(e, t) {
      if (this.clickedElements.size > 0 && this.canAddElement(e) && this.cssSelector.getCssSelector([...this.clickedElements, e], this.selectionLevel, t),
        !this.canSelect(e)) throw new i.SelectionError("Parent does not contain selected element");
    }
    setSelectedElements(e) {
      const t = new Set(e);
      for (const e of t) this.selectedElements.has(e) || (this.selectedElements.add(e),
        e instanceof HTMLElement && e.classList.add(this.elementPreviewClassname));
      for (const e of this.selectedElements) t.has(e) || (this.selectedElements.delete(e),
        e instanceof HTMLElement && e.classList.remove(this.elementPreviewClassname));
    }
  };
},