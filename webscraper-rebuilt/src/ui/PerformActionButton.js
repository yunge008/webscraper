/**
 * UI Component: PerformActionButton
 * Source module ID: 64534
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

64534: function(e, t, r) {
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
  }), t.PerformActionButton = void 0;
  const i = o(r(96540)),
    a = r(57205),
    s = r(1969),
    l = r(90330),
    c = r(48845),
    u = r(82226);
  t.PerformActionButton = () => {
    const e = (0, l.useFormContext)(),
      t = (0, c.useEditSelectorId)(),
      r = (0, a.useSelectorBreadcrumb)();
    return i.default.createElement("button", {
      className: "btn btn-default",
      type: "button",
      onClick: () => n(void 0, void 0, void 0, (function*() {
        const n = e.getValues(),
          o = Object.assign({}, n),
          i = u.appState.sitemap.clone();
        let a, l = !0;
        t && (l = !1, a = i.getSelectorById(t));
        const c = (0, s.selectorFactory)(o, l);
        i.updateSelector(null != a ? a : c, c), yield u.appState.performSelectorAction(c.id, i, r);
      }))
    }, "Perform Action");
  };
},