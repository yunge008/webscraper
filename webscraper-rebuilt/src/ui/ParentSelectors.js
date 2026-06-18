/**
 * UI Component: ParentSelectors
 * Source module ID: 12173
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

12173: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ParentSelectors = void 0;
  const o = n(r(96540)),
    i = r(96540),
    a = r(14313),
    s = r(90330),
    l = r(84417),
    c = r(82226),
    u = r(44015),
    d = r(1969),
    p = r(48845);
  t.ParentSelectors = (0, u.observer)((() => {
    var e;
    const {
      sitemap: t
    } = c.appState, r = (0, s.useFormContext)(), [n, u] = r.watch(["id", "type"]), f = r.watch("parentSelectors"), h = (0,
      l.getValidationStatusClassName)(r.getFieldState("parentSelectors")), m = (0, p.useEditSelectorId)(), g = (0,
      i.useMemo)((() => {
      if (t) {
        const e = t.clone();
        if (m && m !== n) {
          const t = e.selectors.getSelectorById(m);
          if (t) {
            const r = (0, d.selectorFactory)({
              id: n,
              type: u
            }, !0);
            e.updateSelector(t, r);
          }
        } else {
          const t = (0, d.selectorFactory)({
            id: n,
            type: u
          }, !0);
          e.updateSelector(t, t);
        }
        const r = [];
        for (const t of e.selectors) t.canHaveChildSelectors() && r.push(t.id);
        return r.unshift("_root"), r;
      }
      return [];
    }), [t, n, u, m]);
    return (0, i.useEffect)((() => {
      if (m && m !== n) {
        const e = f.filter((e => e !== m));
        f.length > e.length && r.setValue("parentSelectors", e, {
          shouldValidate: !1
        });
      }
    }), [f, m, n, r]), o.default.createElement("div", {
      className: `form-group ${h}`,
      title: "Parent Selectors"
    }, o.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, "Parent Selectors"), o.default.createElement("div", {
      className: "col-lg-10"
    }, o.default.createElement("select", Object.assign({
      className: "form-control",
      multiple: !0
    }, r.register("parentSelectors")), g.map((e => o.default.createElement("option", {
      value: e,
      key: e
    }, e)))), o.default.createElement(a.ValidationError, {
      field: "parentSelectors",
      message: null === (e = r.formState.errors.parentSelectors) || void 0 === e ? void 0 : e.message.toString()
    })));
  }));
},