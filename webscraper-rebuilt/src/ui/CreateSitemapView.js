/**
 * UI Component: CreateSitemapView
 * Source module ID: 52590
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

52590: function(e, t, r) {
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
  }), t.CreateSitemapView = void 0;
  const i = o(r(96540)),
    a = r(96540),
    s = r(14313),
    l = r(90330),
    c = r(9762),
    u = r(49442),
    d = r(33229),
    p = r(84417),
    f = r(11717),
    h = r(1757),
    m = r(789),
    g = r(82226);
  t.CreateSitemapView = () => {
    var e, t, r, o, v, y;
    const b = (0, l.useForm)({
        mode: "all",
        resolver: (0, c.yupResolver)(d.sitemapCreationSchema),
        defaultValues: {
          startUrl: [{
            startUrl: ""
          }]
        }
      }),
      {
        fields: w,
        remove: S,
        insert: x
      } = (0, l.useFieldArray)({
        control: b.control,
        name: "startUrl"
      }),
      A = (0, h.useNavigate)(),
      _ = (0, a.useCallback)((e => n(void 0, void 0, void 0, (function*() {
        if (1 === w.length) b.resetField("startUrl.0.startUrl");
        else {
          S(e);
          for (let t = e; t < w.length; t++) yield b.trigger(`startUrl.${t}.startUrl`);
        }
      }))), [w, b, S]),
      C = (0, a.useCallback)((e => n(void 0, void 0, void 0, (function*() {
        x(e, {
          startUrl: ""
        });
        for (let t = 0; t <= w.length; t++) t !== e && (yield b.trigger(`startUrl.${t}.startUrl`));
      }))), [w, x, b]),
      E = (null === (t = null === (e = b.formState.errors) || void 0 === e ? void 0 : e.startUrl) || void 0 === t ? void 0 : t.message) || (null === (v = null === (o = null === (r = b.formState.errors) || void 0 === r ? void 0 : r.startUrl) || void 0 === o ? void 0 : o.root) || void 0 === v ? void 0 : v.message);
    return i.default.createElement(l.FormProvider, Object.assign({}, b), i.default.createElement("div", {
      className: "form form-horizontal",
      role: "form",
      id: "create-sitemap"
    }, i.default.createElement("div", {
      className: `form-group ${(0, p.getValidationStatusClassName)(b.getFieldState("_id"))}`
    }, i.default.createElement("label", {
      htmlFor: "_id",
      className: "col-lg-1 control-label"
    }, "Sitemap name"), i.default.createElement("div", {
      className: "col-lg-10"
    }, i.default.createElement("input", Object.assign({
      type: "text",
      className: "form-control",
      id: "_id"
    }, b.register("_id"), {
      placeholder: "Sitemap name"
    })), i.default.createElement(s.ValidationError, {
      field: "_id",
      message: null === (y = b.formState.errors._id) || void 0 === y ? void 0 : y.message
    }))), w.map(((e, t) => i.default.createElement(f.StartUrl, {
      key: e.id,
      index: t,
      insert: C,
      remove: _
    }))), i.default.createElement("div", {
      className: "form-group"
    }, i.default.createElement("div", {
      className: "col-lg-offset-1 col-lg-10"
    }, i.default.createElement("div", {
      className: "start-url-count-exceeded-validation-error has-error"
    }, i.default.createElement(s.ValidationError, {
      field: "startUrl",
      message: E
    })), i.default.createElement("button", {
      id: "submit-create-sitemap",
      type: "button",
      className: "btn btn-default",
      onClick: b.handleSubmit((e => n(void 0, void 0, void 0, (function*() {
        const {
          startUrl: t,
          _id: r
        } = e, n = {
          _id: r,
          startUrl: t.map((e => e.startUrl)),
          selectors: []
        };
        yield u.devtoolsBackgroundScriptClient.incrementDailyStat("sitemapsCreated", 1),
          yield g.appState.createSitemap(n), A(`/sitemap/${r}/selectors/${m.Str.serialize([ "_root" ])}`);
      }))))
    }, "Create Sitemap")))));
  };
},