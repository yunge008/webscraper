/**
 * UI Component: EditSitemapMetadataView
 * Source module ID: 50973
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

50973: function(e, t, r) {
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
  }), t.EditSitemapMetadataView = void 0;
  const i = o(r(96540)),
    a = r(96540),
    s = r(11717),
    l = r(14313),
    c = r(90330),
    u = r(9762),
    d = r(84417),
    p = r(90195),
    f = r(33229),
    h = r(1757),
    m = r(789),
    g = r(82226);
  t.EditSitemapMetadataView = () => {
    var e, t, r, o, v, y;
    const [b] = (0, a.useState)(g.appState.getSitemapClone()), w = (0, h.useNavigate)(), S = (0,
      c.useForm)({
      mode: "all",
      resolver: (0, u.yupResolver)(f.sitemapCreationSchema),
      defaultValues: {
        _id: b._id,
        startUrl: p.Url.makeStartUrlObjectList(b.startUrl)
      },
      context: {
        originalSitemapId: b._id
      }
    }), {
      fields: x,
      remove: A,
      insert: _
    } = (0, c.useFieldArray)({
      control: S.control,
      name: "startUrl"
    }), C = (0, a.useCallback)((e => n(void 0, void 0, void 0, (function*() {
      1 === x.length ? (S.resetField("startUrl.0.startUrl"), S.setValue("startUrl.0.startUrl", "")) : (A(e),
        yield S.trigger("startUrl"));
    }))), [x.length, S, A]), E = (0, a.useCallback)((e => n(void 0, void 0, void 0, (function*() {
      _(e, {
        startUrl: ""
      }), yield S.trigger("startUrl");
    }))), [_, S]), k = (null === (t = null === (e = S.formState.errors) || void 0 === e ? void 0 : e.startUrl) || void 0 === t ? void 0 : t.message) || (null === (v = null === (o = null === (r = S.formState.errors) || void 0 === r ? void 0 : r.startUrl) || void 0 === o ? void 0 : o.root) || void 0 === v ? void 0 : v.message);
    return i.default.createElement(c.FormProvider, Object.assign({}, S), i.default.createElement("div", {
      id: "edit-sitemap"
    }, i.default.createElement("div", {
      className: "form form-horizontal",
      role: "form",
      id: "edit-sitemap-metadata-form"
    }, i.default.createElement("div", {
      className: `form-group ${(0, d.getValidationStatusClassName)(S.getFieldState("_id"))}`
    }, i.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, "Sitemap name"), i.default.createElement("div", {
      className: "col-lg-10"
    }, i.default.createElement("input", Object.assign({
      type: "text",
      className: "form-control"
    }, S.register("_id"), {
      id: "_id",
      name: "_id",
      placeholder: "Sitemap name"
    })), i.default.createElement(l.ValidationError, {
      field: "_id",
      message: null === (y = S.formState.errors._id) || void 0 === y ? void 0 : y.message
    }))), x.map(((e, t) => i.default.createElement(s.StartUrl, {
      key: e.id,
      index: t,
      insert: E,
      remove: C
    }))), i.default.createElement("div", {
      className: "form-group"
    }, i.default.createElement("div", {
      className: "col-lg-offset-1 col-lg-10"
    }, i.default.createElement("div", {
      className: "start-url-count-exceeded-validation-error has-error"
    }, i.default.createElement(l.ValidationError, {
      field: "startUrl",
      message: k
    })), i.default.createElement("button", {
      id: "submit-sitemap-metadata",
      type: "button",
      className: "btn btn-primary",
      onClick: S.handleSubmit((e => n(void 0, void 0, void 0, (function*() {
        const {
          startUrl: t,
          _id: r
        } = e, n = t.map((e => e.startUrl)), o = g.appState.getSitemapClone();
        o._id = r, o.startUrl = p.Url.fixStartUrls(n), yield g.appState.updateSitemap(o),
          w(`/sitemap/${r}/selectors/${m.Str.serialize([ "_root" ])}`);
      }))))
    }, "Save Sitemap"))))));
  };
},