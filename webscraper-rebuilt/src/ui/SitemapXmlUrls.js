/**
 * UI Component: SitemapXmlUrls
 * Source module ID: 74073
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

74073: function(e, t, r) {
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
  }), t.SitemapXmlUrls = void 0;
  const i = o(r(96540)),
    a = r(14313),
    s = r(90330),
    l = r(84417),
    c = r(49442),
    u = r(59045);
  t.SitemapXmlUrls = ({
    feature: e
  }) => {
    const t = (0, s.useFormContext)(),
      {
        append: r,
        remove: o,
        replace: d,
        fields: p
      } = (0,
        s.useFieldArray)({
        name: e
      }),
      f = t.watch(e),
      h = p.map(((e, t) => Object.assign(Object.assign({}, e), f[t])));
    return i.default.createElement("div", {
      className: "form-group"
    }, i.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, "Sitemap.xml Urls"), i.default.createElement("div", {
      className: "col-lg-10"
    }, h.map(((r, s) => {
      var c, u, d;
      const f = `sitemapXmlUrls.${s}.url`,
        h = (0, l.getValidationStatusClassName)(t.getFieldState(f));
      return i.default.createElement("div", {
        key: r.id,
        className: `sitemap-xml-url-input-group ${h}`
      }, i.default.createElement("div", {
        className: "input-group vertical-input-item"
      }, i.default.createElement("input", Object.assign({
        type: "text",
        className: "form-control sitemap-xml-url"
      }, t.register(f), {
        placeholder: "https://example.com/sitemap.xml"
      })), i.default.createElement("span", {
        className: "input-group-btn"
      }, i.default.createElement("button", {
        className: "btn btn-danger remove-sitemap-xml-url",
        type: "button",
        name: f,
        onClick: () => (r => n(void 0, void 0, void 0, (function*() {
          1 === p.length ? t.setValue(`${e}.0.url`, "", {
            shouldDirty: !0,
            shouldValidate: !0,
            shouldTouch: !0
          }) : o(r), yield t.trigger("sitemapXmlUrls");
        })))(s)
      }, "Remove"))), i.default.createElement(a.ValidationError, {
        field: f,
        message: null === (d = null === (u = null === (c = t.formState.errors[e]) || void 0 === c ? void 0 : c[s]) || void 0 === u ? void 0 : u.url) || void 0 === d ? void 0 : d.message
      }));
    })), i.default.createElement("button", {
      type: "button",
      className: "btn btn-primary add-sitemap-xml-url",
      onClick: () => n(void 0, void 0, void 0, (function*() {
        r({
          url: ""
        }), yield t.trigger("sitemapXmlUrls");
      }))
    }, "Add Url"), "\xa0", i.default.createElement("button", {
      type: "button",
      className: "btn btn-primary add-from-robots-txt",
      onClick: () => n(void 0, void 0, void 0, (function*() {
        const r = yield c.devtoolsBackgroundScriptClient.getSitemapXmlLinksFromRobotsTxt(), n = t.getValues(e).map((e => e.url));
        let o = u.Arr.mergeUnique(n, r);
        o.length > 0 && (o = u.Arr.removeEmpty(o));
        const i = o.map((e => ({
          url: e
        })));
        i.length || i.push({
          url: ""
        }), d(i), i.forEach(((r, n) => {
          t.setValue(`${e}.${n}.url`, r.url, {
            shouldDirty: !0,
            shouldValidate: !0,
            shouldTouch: !0
          });
        }));
      }))
    }, "Add from robots.txt")));
  };
},