/**
 * Module: Selector
 * Source module ID: 90711
 * Category: scraper
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

90711: function(e, t, r) {
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
    },
    i = this && this.__await || function(e) {
      return this instanceof i ? (this.v = e, this) : new i(e);
    },
    o = this && this.__asyncValues || function(e) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var t, r = e[Symbol.asyncIterator];
      return r ? r.call(e) : (e = "function" == typeof __values ? __values(e) : e[Symbol.iterator](),
        t = {}, n("next"), n("throw"), n("return"), t[Symbol.asyncIterator] = function() {
          return this;
        }, t);

      function n(r) {
        t[r] = e[r] && function(t) {
          return new Promise((function(n, i) {
            (function(e, t, r, n) {
              Promise.resolve(n).then((function(t) {
                e({
                  value: t,
                  done: r
                });
              }), t);
            })(n, i, (t = e[r](t)).done, t.value);
          }));
        };
      }
    },
    s = this && this.__asyncDelegator || function(e) {
      var t, r;
      return t = {}, n("next"), n("throw", (function(e) {
        throw e;
      })), n("return"), t[Symbol.iterator] = function() {
        return this;
      }, t;

      function n(n, o) {
        t[n] = e[n] ? function(t) {
          return (r = !r) ? {
            value: i(e[n](t)),
            done: !1
          } : o ? o(t) : t;
        } : o;
      }
    },
    a = this && this.__asyncGenerator || function(e, t, r) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var n, o = r.apply(e, t || []),
        s = [];
      return n = Object.create(("function" == typeof AsyncIterator ? AsyncIterator : Object).prototype),
        a("next"), a("throw"), a("return", (function(e) {
          return function(t) {
            return Promise.resolve(t).then(e, u);
          };
        })), n[Symbol.asyncIterator] = function() {
          return this;
        }, n;

      function a(e, t) {
        o[e] && (n[e] = function(t) {
          return new Promise((function(r, n) {
            s.push([e, t, r, n]) > 1 || l(e, t);
          }));
        }, t && (n[e] = t(n[e])));
      }

      function l(e, t) {
        try {
          (r = o[e](t)).value instanceof i ? Promise.resolve(r.value.v).then(c, u) : d(s[0][2], r);
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
  }), t.Selector = void 0;
  const l = r(83258),
    c = r(74161),
    u = r(14288),
    d = r(18211),
    h = r(79964);
  t.Selector = class {
    constructor() {
      this.id = "", this.parentSelectors = [];
    }
    getUIValue(e) {
      return this[e];
    }
    getValidationData() {
      return this;
    }
    dataKeysToExportAsNumbers() {
      return ["delay", "elementLimit"];
    }
    willReturnMultipleRecords() {
      return this.canReturnMultipleRecords() && this.multiple;
    }
    hasParentSelector(e) {
      return this.parentSelectors.includes(e);
    }
    removeParentSelector(e) {
      const t = this.parentSelectors.indexOf(e); -
      1 !== t && this.parentSelectors.splice(t, 1);
    }
    renameParentSelector(e, t) {
      if (this.hasParentSelector(e)) {
        const r = this.parentSelectors.indexOf(e);
        this.parentSelectors.splice(r, 1, t);
      }
    }
    getDataElements(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield e.getElements(this.selector);
        return this.multiple ? t : t.length > 0 ? [t[0]] : [];
      }));
    }
    getData(e, t, r) {
      return a(this, arguments, (function*() {
        yield i(this.waitDelay()), yield i(yield* s(o(this._getData(e, t, r))));
      }));
    }
    getDataArray(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        var n, i, s, a;
        const l = [];
        try {
          for (var c, u = !0, h = o(this.getData(e, t, r)); !(n = (c = yield h.next()).done); u = !0) {
            a = c.value, u = !1;
            const e = a;
            if (e instanceof d.WebPageChromeTabElement)
              if (e.isJsDisabled()) l.push(e);
              else {
                const t = yield e.getClone();
                l.push(t);
              }
            else l.push(e);
          }
        } catch (e) {
          i = {
            error: e
          };
        } finally {
          try {
            u || n || !(s = h.return) || (yield s.call(h));
          } finally {
            if (i) throw i.error;
          }
        }
        return l;
      }));
    }
    getEmptyRecord() {
      const e = this.getDataColumns(),
        t = {};
      for (const r of e) t[r] = void 0;
      return t;
    }
    hasFeature(e) {
      return this.getFeatures().includes(e);
    }
    isLinkSelector() {
      return !1;
    }
    shouldDeduplicateChildSelectorData() {
      return !1;
    }
    getDeduplicator(e) {
      return new h.NoneDeduplicator;
    }
    shouldDiscardEmptyValues() {
      return !1;
    }
    getDeprecatedFeatures() {
      return [];
    }
    isDeprecatedFeature(e) {
      return this.getDeprecatedFeatures().includes(e);
    }
    waitDelay() {
      return n(this, void 0, void 0, (function*() {
        const e = this.delay || 0;
        0 !== e && (yield l.Async.sleep(e));
      }));
    }
    getExperimentalFeatures() {
      return [];
    }
    getHiddenFeatures() {
      return [];
    }
    optimizeCSSSelectors() {
      for (const e of this.getSelectorsForOptimization()) this[e] = u.SelectorOptimizer.optimize(this[e]);
    }
    getFormatters() {
      const e = this.getDataColumns(),
        t = {};
      for (const r of e) t[r] = [{
        type: "default"
      }];
      return t;
    }
    updateData(e, t = !1) {
      let r = ["id", "type", "parentSelectors"];
      r = r.concat(...this.getFeatures(), ...this.getHiddenFeatures());
      const n = this.dataKeysToExportAsNumbers();
      t || (e = Object.assign(Object.assign({}, this.getNewFeatureData()), e));
      for (const t in e)
        if (r.includes(t)) n.includes(t) && "" !== e[t] ? this[t] = parseInt(e[t], 10) : this[t] = e[t];
        else {
          if ("delay" === t) continue;
          c.Log.notice("configuring incorrect key for selector", {
            key: t,
            selector: JSON.stringify(this),
            allowedKeys: JSON.stringify(r)
          });
        }
    }
    getNewFeatureData() {
      return {};
    }
  };
},