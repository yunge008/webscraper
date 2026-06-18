/**
 * UI Component: DataPreviewButton
 * Source module ID: 38959
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

38959: function(e, t, r) {
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
  }), t.DataPreviewButton = void 0;
  const i = o(r(96540)),
    a = r(57205),
    s = r(1969),
    l = r(90330),
    c = r(48845),
    u = r(82226);
  t.DataPreviewButton = () => {
    const e = (0, l.useFormContext)(),
      t = (0, c.useEditSelectorId)(),
      r = (0, a.useSelectorBreadcrumb)();
    return i.default.createElement("button", {
      id: "selector-data-preview",
      className: "btn btn-default data-preview",
      type: "button",
      onClick: () => n(void 0, void 0, void 0, (function*() {
        const n = e.getValues(),
          o = n.type,
          i = n.sitemapXmlUrls.map((e => e.url)),
          a = Object.assign(Object.assign({}, n), {
            type: o,
            sitemapXmlUrls: i
          }),
          l = u.appState.sitemap.clone();
        let c, d = !0;
        t && (d = !1, c = l.getSelectorById(t));
        const p = (0, s.selectorFactory)(a, d);
        l.updateSelector(null != c ? c : p, p), yield u.appState.dataPreview(p.id, l, r);
      }))
    }, "Data preview");
  };
},