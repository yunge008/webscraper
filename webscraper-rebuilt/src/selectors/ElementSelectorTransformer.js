/**
 * Module: ElementSelectorTransformer
 * Source module ID: 33741
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

33741: (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ElementSelectorTransformer = void 0;
  t.ElementSelectorTransformer = class {
    constructor(e, t, r) {
      this.selector = e, this.type = t, this.value = r;
    }
    disable() {
      switch (this.type) {
        case "index":
          this.originalValue = this.selector.index, this.selector.index = void 0;
          break;

        case "isDirectChild":
          this.originalValue = this.selector.isDirectChild, this.selector.isDirectChild = !1;
          break;

        case "attribute":
          this.originalValue = this.value, this.selector.attributes.delete(this.value);
          break;

        case "tag":
          this.originalValue = this.selector.showTag, this.selector.showTag = !1;
          break;

        case "previousSiblingText":
          this.originalValue = this.selector.previousSiblingText, this.selector.previousSiblingText = void 0;
          break;

        case "id":
          this.originalValue = this.selector.id, this.selector.id = void 0;
          break;

        case "class":
          this.originalValue = this.value, this.selector.classes.delete(this.value);
          break;

        case "generatedClass":
          this.originalValue = this.value, this.selector.generatedClasses.delete(this.value);
          break;

        case "schemaOrgAttribute":
          this.originalValue = this.value, this.selector.schemaOrgAttributes.delete(this.value);
          break;

        case "betterThanClassesAttribute":
          this.originalValue = this.value, this.selector.betterThanClassesAttributes.delete(this.value);
      }
    }
    rollback() {
      switch (this.type) {
        case "index":
          this.selector.index = this.originalValue;
          break;

        case "isDirectChild":
          this.selector.isDirectChild = this.originalValue;
          break;

        case "attribute":
          this.selector.attributes.add(this.originalValue);
          break;

        case "tag":
          this.selector.showTag = this.originalValue;
          break;

        case "previousSiblingText":
          this.selector.previousSiblingText = this.originalValue;
          break;

        case "id":
          this.selector.id = this.originalValue;
          break;

        case "class":
          this.selector.classes.add(this.originalValue);
          break;

        case "generatedClass":
          this.selector.generatedClasses.add(this.originalValue);
          break;

        case "schemaOrgAttribute":
          this.selector.schemaOrgAttributes.add(this.originalValue);
          break;

        case "betterThanClassesAttribute":
          this.selector.betterThanClassesAttributes.add(this.originalValue);
      }
    }
  };
},