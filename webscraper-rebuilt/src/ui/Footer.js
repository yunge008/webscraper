/**
 * UI Component: Footer
 * Source module ID: 28282
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

28282: function(e, t, r) {
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
  }), t.Footer = void 0;
  const i = o(r(96540)),
    a = r(90330),
    s = r(14313),
    l = r(38959),
    c = r(1969),
    u = r(64534),
    d = r(1757),
    p = r(44015),
    f = r(57205),
    h = r(48845),
    m = r(82226);
  t.Footer = (0, p.observer)((() => {
    var e;
    const t = m.appState.sitemap,
      r = (0, d.useNavigate)(),
      o = (0, a.useFormContext)(),
      p = o.watch("type"),
      g = (0,
        c.selectorFactory)({
        type: p
      }, !0),
      v = g.hasFeature("dataPreviewButton"),
      y = g.hasFeature("performActionButton"),
      b = ((0,
        f.useSelectorBreadcrumb)(), (0, h.useEditSelectorId)());
    return i.default.createElement("div", {
      className: "form-group"
    }, i.default.createElement("div", {
      className: "col-lg-offset-1 col-lg-10"
    }, i.default.createElement("div", {
      className: "btn-block"
    }, y && i.default.createElement(u.PerformActionButton, null), v && i.default.createElement(l.DataPreviewButton, null), i.default.createElement("div", {
      className: "selector-count-exceeded-validation-error has-error"
    }, i.default.createElement(s.ValidationError, {
      field: "id",
      message: null === (e = o.formState.errors.selectors) || void 0 === e ? void 0 : e.message.toString()
    })), i.default.createElement("button", {
      id: "save-selector",
      className: "btn btn-primary",
      type: "button",
      onClick: o.handleSubmit((e => n(void 0, void 0, void 0, (function*() {
        const n = e.sitemapXmlUrls.map((e => e.url)),
          o = Object.assign(Object.assign({}, e), {
            sitemapXmlUrls: n
          }),
          i = (0, c.selectorFactory)(o),
          a = t.clone();
        if (b) {
          const e = a.selectors.getSelectorById(b);
          a.updateSelector(e, i, !1);
        } else a.updateSelector(i, i);
        yield m.appState.updateSitemapWithNewSelector(a), r(-1);
      }))))
    }, "Save selector"), i.default.createElement("button", {
      className: "btn btn-danger cancel-selector-editing",
      type: "button",
      onClick: () => {
        r(-1);
      }
    }, "Cancel"))));
  }));
},