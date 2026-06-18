/**
 * Module: SelectorPopupLink
 * Source module ID: 94592
 * Category: selectors
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

94592: function(e, t, r) {
  "use strict";
  var n = this && this.__await || function(e) {
      return this instanceof n ? (this.v = e, this) : new n(e);
    },
    i = this && this.__asyncGenerator || function(e, t, r) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var i, o = r.apply(e, t || []),
        s = [];
      return i = Object.create(("function" == typeof AsyncIterator ? AsyncIterator : Object).prototype),
        a("next"), a("throw"), a("return", (function(e) {
          return function(t) {
            return Promise.resolve(t).then(e, u);
          };
        })), i[Symbol.asyncIterator] = function() {
          return this;
        }, i;

      function a(e, t) {
        o[e] && (i[e] = function(t) {
          return new Promise((function(r, n) {
            s.push([e, t, r, n]) > 1 || l(e, t);
          }));
        }, t && (i[e] = t(i[e])));
      }

      function l(e, t) {
        try {
          (r = o[e](t)).value instanceof n ? Promise.resolve(r.value.v).then(c, u) : d(s[0][2], r);
        } catch (e) {
          d(s[0][3], e);
        }
        var r;
      }

      function c(e) {
        l("next", e);
      }

      function u(e) {
        l("throw", e);
      }

      function d(e, t) {
        e(t), s.shift(), s.length && l(s[0][0], s[0][1]);
      }
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorPopupLink = void 0;
  const o = r(90195),
    s = r(90711);
  class a extends s.Selector {
    constructor(e) {
      super(), this.type = "SelectorPopupLink", this.selector = "", this.multiple = !1,
        this.updateData(e);
    }
    canReturnMultipleRecords() {
      return !0;
    }
    canHaveChildSelectors() {
      return !0;
    }
    canCreateNewJobs() {
      return !0;
    }
    willReturnElements() {
      return !1;
    }
    _getData(e) {
      return i(this, arguments, (function*() {
        const t = yield n(this.getDataElements(e));
        !1 === this.multiple && 0 === t.length && (yield yield n(this.getEmptyRecord()));
        for (const e of t) {
          const t = yield n(e.getText()), r = yield n(e.getPopupURL()), i = o.Url.escapeWhiteSpace(r), s = {
            [this.id]: t,
            [`${this.id}-href`]: i,
            _followSelectorId: this.id,
            _follow: i
          };
          yield yield n(s);
        }
      }));
    }
    getDataColumns() {
      return [this.id, `${this.id}-href`];
    }
    getFeatures() {
      return ["selector", "multiple"];
    }
    isLinkSelector() {
      return !0;
    }
    getSelectorsForOptimization() {
      return ["selector"];
    }
  }
  t.SelectorPopupLink = a;
},