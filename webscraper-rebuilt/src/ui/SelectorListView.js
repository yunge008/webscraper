/**
 * UI Component: SelectorListView
 * Source module ID: 92909
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

92909: function(e, t, r) {
  "use strict";
  var n, o = this && this.__createBinding || (Object.create ? function(e, t, r, n) {
      void 0 === n && (n = r);
      var o = Object.getOwnPropertyDescriptor(t, r);
      o && !("get" in o ? !t.__esModule : o.writable || o.configurable) || (o = {
        enumerable: !0,
        get: function() {
          return t[r];
        }
      }), Object.defineProperty(e, n, o);
    } : function(e, t, r, n) {
      void 0 === n && (n = r), e[n] = t[r];
    }),
    i = this && this.__setModuleDefault || (Object.create ? function(e, t) {
      Object.defineProperty(e, "default", {
        enumerable: !0,
        value: t
      });
    } : function(e, t) {
      e.default = t;
    }),
    a = this && this.__importStar || (n = function(e) {
      return n = Object.getOwnPropertyNames || function(e) {
        var t = [];
        for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && (t[t.length] = r);
        return t;
      }, n(e);
    }, function(e) {
      if (e && e.__esModule) return e;
      var t = {};
      if (null != e)
        for (var r = n(e), a = 0; a < r.length; a++) "default" !== r[a] && o(t, e, r[a]);
      return i(t, e), t;
    }),
    s = this && this.__awaiter || function(e, t, r, n) {
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
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.SelectorList = void 0;
  const l = a(r(96540)),
    c = r(24765),
    u = r(49876),
    d = r(8763),
    p = r(1757),
    f = r(57205),
    h = r(44015),
    m = r(92234),
    g = r(789),
    v = r(82226);
  t.SelectorList = (0, h.observer)((() => {
    const [e, t] = l.default.useState(void 0), {
      loading: r,
      sitemap: n
    } = v.appState, o = (0,
      p.useNavigate)(), i = (0, f.useSelectorBreadcrumb)(), a = (0, p.useParams)(), h = i[i.length - 1], [y, b] = (0,
      l.useState)(), [w, S] = (0, l.useState)(), [x, A] = (0, l.useState)([]), _ = (0,
      l.useCallback)((() => {
      o(`/sitemap/${a.sitemapId}/create-selector/${g.Str.serialize(i)}`);
    }), [o, i, a.sitemapId]), C = (0, l.useCallback)((e => {
      t(e), v.appState.updateDeletionConfirmationModalVisible(!0);
    }), [v.appState, t]), E = (0, l.useCallback)((() => s(void 0, void 0, void 0, (function*() {
      yield v.appState.deleteSelector(e);
    }))), [e, v.appState]);
    return (0, l.useEffect)((() => {
      if (!n) return;
      const e = n.getDirectChildSelectors(h);
      A(e);
      const t = n.getSelectorById(h);
      t ? (b(t.type), "SelectorLink" === t.type ? S(t.version) : S(void 0)) : (b(void 0),
        S(void 0));
    }), [h, n]), r ? l.default.createElement(d.Loader, null) : l.default.createElement("div", {
      id: "selector-tree"
    }, l.default.createElement(m.SelectorBreadcrumb, null), l.default.createElement("table", {
      className: "table table-bordered table-condensed table-hover selector-table"
    }, l.default.createElement("thead", null, l.default.createElement("tr", null, l.default.createElement("th", {
      style: {
        width: "31px"
      }
    }), l.default.createElement("th", null, "ID"), l.default.createElement("th", null, "Selector"), l.default.createElement("th", {
      style: {
        width: "60px"
      }
    }, "type"), l.default.createElement("th", {
      style: {
        width: "60px"
      }
    }, "Multiple"), l.default.createElement("th", null, "Parent selectors"), l.default.createElement("th", {
      style: {
        width: "295px"
      }
    }, "Actions"))), l.default.createElement("tbody", null, null == x ? void 0 : x.map(((e, t) => l.default.createElement(c.SelectorRow, {
      selector: e,
      key: e.id,
      index: t,
      handleDeleteSelector: C
    }))))), l.default.createElement("div", {
      className: "footer-buttons"
    }, l.default.createElement("button", {
      type: "button",
      className: "btn btn-primary btn-xs add-selector",
      onClick: _
    }, "Add new selector"), l.default.createElement("span", {
      className: "generate-selectors-with-ai"
    }, "Generate Selectors with AI (Alpha):"), l.default.createElement("button", {
      type: "button",
      className: "btn btn-secondary btn-xs generate-selectors",
      onClick: () => s(void 0, void 0, void 0, (function*() {
        yield v.appState.generateSelectors(i);
      }))
    }, "Listing page"), "SelectorLink" === y && 2 === w && l.default.createElement("button", {
      type: "button",
      className: "btn btn-secondary btn-xs generate-single-selectors",
      onClick: () => s(void 0, void 0, void 0, (function*() {
        yield v.appState.generateSingleV2(i);
      }))
    }, "Single item page")), l.default.createElement(u.DeletionConfirmationModal, {
      performDeletion: E,
      confirmationText: `Are you sure you want to delete selector ${e ? e.id : ""}?`
    }));
  }));
},