/**
 * UI Component: ImportSitemapView
 * Source module ID: 54999
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

54999: function(e, t, r) {
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
  }), t.ImportSitemapView = void 0;
  const i = o(r(96540)),
    a = r(90330),
    s = r(9762),
    l = r(34248),
    c = r(14313),
    u = r(49442),
    d = r(84417),
    p = r(1757),
    f = r(789),
    h = r(82226);
  t.ImportSitemapView = () => {
    var e, t;
    const {
      register: r,
      handleSubmit: o,
      getFieldState: m,
      formState: {
        errors: g
      },
      getValues: v,
      setValue: y
    } = (0,
      a.useForm)({
      mode: "all",
      resolver: (0, s.yupResolver)(l.importSitemapViewSchema)
    }), b = (0, p.useNavigate)();
    return i.default.createElement("div", {
      className: "form form-horizontal",
      role: "form"
    }, i.default.createElement("div", {
      className: `form-group ${(0, d.getValidationStatusClassName)(m("sitemapJSON"))}`
    }, i.default.createElement("label", {
      htmlFor: "sitemapJSON",
      className: "col-lg-1 control-label"
    }, "Sitemap JSON"), i.default.createElement("div", {
      className: "col-lg-10"
    }, i.default.createElement("textarea", Object.assign({
      rows: 7,
      id: "sitemapJSON",
      className: "form-control"
    }, r("sitemapJSON", {
      onChange: e => {
        try {
          const t = JSON.parse(e.target.value);
          y("_id", t._id, {
            shouldValidate: !0
          });
        } catch (e) {}
      }
    }))), i.default.createElement(c.ValidationError, {
      field: "sitemapJSON",
      message: null === (e = g.sitemapJSON) || void 0 === e ? void 0 : e.message
    }))), i.default.createElement("div", {
      className: `form-group ${(0, d.getValidationStatusClassName)(m("_id"))}`
    }, i.default.createElement("label", {
      htmlFor: "edit_sitemap_id",
      className: "col-lg-1 control-label"
    }, "Sitemap name"), i.default.createElement("div", {
      className: "col-lg-10"
    }, i.default.createElement("input", Object.assign({
      type: "text",
      id: "_id",
      className: "form-control",
      placeholder: "Sitemap name"
    }, r("_id", {
      onChange: e => {
        const t = e.target.value,
          r = v("sitemapJSON");
        if (r) try {
          const e = JSON.parse(r);
          e._id = t;
          const n = JSON.stringify(e);
          y("sitemapJSON", n, {
            shouldValidate: !0
          });
        } catch (e) {}
      }
    }))), i.default.createElement(c.ValidationError, {
      field: "_id",
      message: null === (t = g._id) || void 0 === t ? void 0 : t.message
    }))), i.default.createElement("div", {
      className: "form-group"
    }, i.default.createElement("div", {
      className: "col-lg-offset-1 col-lg-10"
    }, i.default.createElement("button", {
      type: "button",
      onClick: o((e => n(void 0, void 0, void 0, (function*() {
        const t = JSON.parse(e.sitemapJSON);
        t._id = e._id, yield u.devtoolsBackgroundScriptClient.incrementDailyStat("sitemapsImported", 1),
          yield h.appState.createSitemap(t), b(`/sitemap/${t._id}/selectors/${f.Str.serialize([ "_root" ])}`);
      })))),
      className: "btn btn-default",
      id: "submit-import-sitemap"
    }, "Import Sitemap"))));
  };
},