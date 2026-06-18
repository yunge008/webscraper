/**
 * UI Component: ElementSelectorUI
 * Source module ID: 77928
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

77928: function(e, t, r) {
  "use strict";
  var n = this && this.__awaiter || function(e, t, r, n) {
      return new(r || (r = Promise))((function(o, i) {
        function a(e) {
          try {
            l(n.next(e));
          } catch (e) {
            i(e);
          }
        }

        function s(e) {
          try {
            l(n.throw(e));
          } catch (e) {
            i(e);
          }
        }

        function l(e) {
          var t;
          e.done ? o(e.value) : (t = e.value, t instanceof r ? t : new r((function(e) {
            e(t);
          }))).then(a, s);
        }
        l((n = n.apply(e, t || [])).next());
      }));
    },
    o = this && this.__importDefault || function(e) {
      return e && e.__esModule ? e : {
        default: e
      };
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ElementSelector = void 0;
  const i = o(r(96540)),
    a = r(90330),
    s = r(84417),
    l = r(38959),
    c = r(14313),
    u = r(57205),
    d = r(1969),
    p = r(3358),
    f = r(62677),
    h = r(44015),
    m = r(82226),
    g = {
      selector: "Selector",
      selectorScrollElement: "Scroll element",
      selectorScrollDownIfElementNotVisible: "Scroll only if missing",
      selectorScrollToElement: "Scroll to element",
      clickElementSelector: "Click selector",
      tableHeaderRowSelector: "Header row selector",
      tableDataRowSelector: "Data rows selector",
      performWhenNotFoundSelector: "Perform when not found selector"
    };
  t.ElementSelector = (0, h.observer)((({
    feature: e
  }) => {
    var t, r;
    const o = (0, a.useFormContext)(),
      h = o.watch("type") || "SelectorElement",
      v = g[e],
      y = o.watch(e),
      b = (0,
        u.useSelectorBreadcrumb)(),
      w = (0, d.selectorFactory)({
        type: h
      }, !0),
      S = (e, t) => n(void 0, void 0, void 0, (function*() {
        if (w instanceof p.SelectorTable) {
          const r = e.selectors.getParentCSSSelectorWithinOnePage(b) + t,
            n = yield f.DevToolsContentScriptClient.getCssSelectorHTML(r), i = w.getTableHeaderRowSelectorFromTableHTML(n), a = w.getTableDataRowSelectorFromTableHTML(n), s = w.getTableHeaderColumnsFromHTML(i, n);
          o.setValue("tableHeaderRowSelector", i, {
            shouldValidate: !0,
            shouldDirty: !0,
            shouldTouch: !0
          }), o.setValue("tableDataRowSelector", a, {
            shouldValidate: !0,
            shouldDirty: !0,
            shouldTouch: !0
          }), o.setValue("columns", s, {
            shouldValidate: !0,
            shouldDirty: !0,
            shouldTouch: !0
          });
        }
      })),
      x = () => {
        let e;
        switch (h) {
          case "SelectorLink":
            e = "linkFromRedirect" === o.getValues("linkType") ? "none" : "link";
            break;

          case "SelectorImage":
            e = "image";
            break;

          case "SelectorTable":
            e = "table";
            break;

          default:
            e = "none";
        }
        return e;
      },
      A = (0, s.getValidationStatusClassName)(o.getFieldState(e)),
      _ = m.appState.activeElementPreview === e ? "Close preview" : "Element preview";
    return i.default.createElement("div", {
      className: `form-group ${A}`,
      key: e
    }, i.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, v), i.default.createElement("div", {
      className: "col-lg-10"
    }, i.default.createElement("div", {
      className: "input-group"
    }, i.default.createElement("span", {
      className: "input-group-btn"
    }, i.default.createElement("button", {
      className: `btn btn-default select-${e}`,
      type: "button",
      onClick: () => n(void 0, void 0, void 0, (function*() {
        switch (e) {
          case "tableHeaderRowSelector":
            return n(void 0, void 0, void 0, (function*() {
              const e = m.appState.sitemap.clone();
              w.selector = o.getValues("selector"), e.updateSelector(w, w);
              const t = yield m.appState.selectSelector(e, "tableRow", b, !1, w.id);
              if (!t.CSSSelector) return;
              const r = t.CSSSelector,
                n = e.selectors.getParentCSSSelectorWithinOnePage(b) + o.getValues("selector"),
                i = yield f.DevToolsContentScriptClient.getCssSelectorHTML(n), a = w.getTableHeaderColumnsFromHTML(r, i);
              o.setValue("tableHeaderRowSelector", r, {
                shouldValidate: !0,
                shouldDirty: !0,
                shouldTouch: !0
              }), o.setValue("columns", a, {
                shouldValidate: !0,
                shouldDirty: !0,
                shouldTouch: !0
              });
            }));

          case "tableDataRowSelector":
            return n(void 0, void 0, void 0, (function*() {
              const e = m.appState.sitemap.clone();
              w.selector = o.getValues("selector"), w.tableHeaderRowSelector = o.getValues("tableHeaderRowSelector"),
                e.updateSelector(w, w);
              const t = yield m.appState.selectSelector(e, "tableRow", b, !1, w.id);
              if (!t.CSSSelector) return;
              const r = t.CSSSelector;
              o.setValue("tableDataRowSelector", r, {
                shouldValidate: !0,
                shouldDirty: !0,
                shouldTouch: !0
              });
            }));

          default:
            return n(void 0, void 0, void 0, (function*() {
              const t = m.appState.sitemap.clone();
              t.updateSelector(w, w);
              const r = x(),
                n = yield m.appState.selectSelector(t, r, b, !1);
              n.CSSSelector && (o.setValue(e, n.CSSSelector, {
                shouldValidate: !0,
                shouldDirty: !0,
                shouldTouch: !0
              }), n.changeLinkType && o.setValue("linkType", n.changeLinkType), yield S(t, n.CSSSelector));
            }));
        }
      }))
    }, "Select"), i.default.createElement("button", {
      className: `btn btn-default element-preview element-preview-${e} edit-element-preview`,
      type: "button",
      onClick: () => n(void 0, void 0, void 0, (function*() {
        const t = m.appState.sitemap.clone();
        yield m.appState.elementPreview(t, e, y, b);
      }))
    }, _), "selector" === e && i.default.createElement(l.DataPreviewButton, null)), i.default.createElement("input", Object.assign({
      id: e,
      type: "text",
      className: "form-control selector-value"
    }, o.register(e)))), i.default.createElement(c.ValidationError, {
      field: e,
      message: null === (r = null === (t = o.formState.errors) || void 0 === t ? void 0 : t[e]) || void 0 === r ? void 0 : r.message.toString()
    })));
  }));
},