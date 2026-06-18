/**
 * UI Component: EditSitemapSelectorView
 * Source module ID: 88653
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

88653: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.EditSitemapSelectorView = void 0;
  const o = n(r(96540)),
    i = r(96540),
    a = r(44015),
    s = r(82226),
    l = r(77928),
    c = r(98536),
    u = r(15866),
    d = r(45877),
    p = r(50869),
    f = r(71322),
    h = r(79915),
    m = r(74073),
    g = r(86458),
    v = r(28185),
    y = r(57205),
    b = r(90330),
    w = r(9762),
    S = r(75071),
    x = r(1969),
    A = r(41006),
    _ = r(26815),
    C = r(74161),
    E = r(12173),
    k = r(28282),
    O = r(48845),
    T = r(59531),
    P = r(48500),
    R = {
      selector: l.ElementSelector,
      selectorScrollElement: l.ElementSelector,
      selectorScrollDownIfElementNotVisible: l.ElementSelector,
      selectorScrollToElement: l.ElementSelector,
      clickElementSelector: l.ElementSelector,
      tableHeaderRowSelector: l.ElementSelector,
      tableDataRowSelector: l.ElementSelector,
      clickType: c.SelectorSubtype,
      paginationType: c.SelectorSubtype,
      clickElementUniquenessType: c.SelectorSubtype,
      linkType: c.SelectorSubtype,
      discardInitialElements: c.SelectorSubtype,
      multiple: u.FormCheckbox,
      scroll: T.ScrollCheckbox,
      regex: d.FormInput,
      elementLimit: p.ItemLimit,
      columns: f.Columns,
      extractAttribute: h.AttributeAutocomplete,
      sitemapXmlUrls: m.SitemapXmlUrls,
      sitemapXmlUrlRegex: d.FormInput,
      sitemapXmlMinimumPriority: d.FormInput,
      delay: d.FormInput,
      script: g.Script,
      scriptDataColumns: v.ScriptDataColumns,
      multipleType: P.MultipleTypeDropdown
    };
  t.EditSitemapSelectorView = (0, a.observer)((() => {
    const {
      sitemap: e
    } = s.appState, t = (null == e ? void 0 : e.selectors) || [], r = (0,
      y.useSelectorBreadcrumb)(), n = (0, O.useEditSelectorId)(), a = (0, i.useMemo)((() => ({
      type: "SelectorText",
      selector: "",
      selectorScrollElement: "",
      selectorScrollDownIfElementNotVisible: "",
      selectorScrollToElement: "",
      clickElementSelector: "",
      tableHeaderRowSelector: "",
      tableDataRowSelector: "",
      id: "",
      parentSelectors: [r[r.length - 1]],
      regex: "",
      columns: [],
      sitemapXmlUrls: [{
        url: ""
      }],
      sitemapXmlUrlRegex: "",
      sitemapXmlMinimumPriority: "0.1",
      delay: "2000",
      script: "",
      scriptDataColumns: [{
        name: "",
        is_url: !1
      }],
      elementLimit: "",
      multiple: !1,
      columnCount: 5
    })), [r]), l = (0, b.useForm)({
      mode: "all",
      resolver: (0, w.yupResolver)(S.lazySchema),
      defaultValues: a,
      context: {
        originalSelectorId: n,
        selectorList: t || []
      }
    }), c = l.watch("type"), u = (0, i.useMemo)((() => (0, x.selectorFactory)({
      type: c
    }, !0)), [c]), d = u.getFeatures();
    return (0, i.useEffect)((() => {
      const t = l.formState.isDirty,
        r = {};
      for (const e of d) r[e] = u[e];
      const o = Object.assign(Object.assign(Object.assign({}, a), r), {
        type: c,
        id: l.getValues("id"),
        selector: l.getValues("selector")
      });
      if (!t && n && e) {
        const t = e.getSelectorById(n),
          r = t.getFeatures(),
          i = t.getHiddenFeatures(),
          a = {};
        a.id = t.id, a.type = t.type, a.parentSelectors = t.parentSelectors;
        for (const e of [...r, ...i]) a[e] = t[e];
        a.sitemapXmlUrls && (a.sitemapXmlUrls = a.sitemapXmlUrls.map((e => ({
          url: e
        })))), Object.assign(o, a);
      }
      l.reset(o);
    }), [u, n, e]), o.default.createElement(b.FormProvider, Object.assign({}, l), o.default.createElement("div", {
      className: "form form-horizontal",
      role: "form",
      id: "edit-selector"
    }, o.default.createElement(A.Input, {
      id: "selectorId",
      label: "Id",
      field: "id",
      placeholder: "Selector Id"
    }), o.default.createElement(_.SelectorTypeDropdown, null), d.map((e => {
      const t = R[e];
      return t ? o.default.createElement(t, {
        key: e,
        feature: e
      }) : (C.Log.info("No component for feature", {
        feature: e
      }), o.default.createElement(o.default.Fragment, null));
    })), o.default.createElement(E.ParentSelectors, null), o.default.createElement(k.Footer, null)));
  }));
},