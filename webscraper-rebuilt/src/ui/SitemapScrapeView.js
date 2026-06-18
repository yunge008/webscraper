/**
 * UI Component: SitemapScrapeView
 * Source module ID: 80018
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

80018: function(e, t, r) {
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
  }), t.SitemapScrapeView = void 0;
  const l = r(44015),
    c = a(r(96540)),
    u = r(49442),
    d = r(52721),
    p = r(49927),
    f = r(1757),
    h = r(90330),
    m = r(9762),
    g = r(41006),
    v = r(82226);
  t.SitemapScrapeView = (0, l.observer)((() => {
    const [e, t] = c.default.useState(!1), r = (0, c.useMemo)((() => e ? "" : " hide"), [e]), n = (0,
      c.useMemo)((() => e ? "Loading..." : "Start scraping"), [e]), o = (0, f.useParams)(), i = (0,
      f.useNavigate)(), a = (0, h.useForm)({
      mode: "all",
      resolver: (0, m.yupResolver)(d.sitemapScrapeSchema),
      defaultValues: {
        requestInterval: "2000",
        pageLoadDelay: "2000"
      }
    }), l = (0, c.useCallback)((() => s(void 0, void 0, void 0, (function*() {
      if (!a.formState.isValid) return;
      const e = v.appState.getSitemapClone();
      if (p.WebsiteStateSetup.foundEmptyPasswordField(e.websiteStateSetup)) return void v.appState.setErrors("An empty password field value was found in Website State setup.", "scrape");
      t(!0), e.optimizeSelectorsForPerformance();
      const {
        requestInterval: r,
        pageLoadDelay: n
      } = a.getValues(), s = {
        sitemap: e,
        requestInterval: parseInt(r, 10),
        pageLoadDelay: parseInt(n, 10)
      };
      yield u.devtoolsBackgroundScriptClient.incrementDailyStat("scrapingJobsRun", 1),
        yield u.devtoolsBackgroundScriptClient.deleteSitemapData(e._id), u.devtoolsBackgroundScriptClient.scrape(s),
          i(`/sitemap/${o.sitemapId}/browse`);
    }))), [v.appState, i, o.sitemapId, t, a, a.formState.isValid]);
    return c.default.createElement(h.FormProvider, Object.assign({}, a), c.default.createElement("div", {
      className: "form form-horizontal",
      role: "form",
      id: "submit-scrape-sitemap-form"
    }, c.default.createElement(g.Input, {
      label: "Request interval (ms)",
      placeholder: "Request interval",
      field: "requestInterval"
    }), c.default.createElement(g.Input, {
      label: "Page load delay (ms)",
      placeholder: "Page load delay",
      field: "pageLoadDelay"
    }), c.default.createElement("div", {
      className: `alert alert-success col-lg-10 col-lg-offset-1 scraping-in-progress${r}`,
      role: "alert"
    }, "Scraping in progress. Close the popup to stop scraping.", c.default.createElement("br", null), "When scraping is finished you can browse the data or export it as CSV.", c.default.createElement("br", null), "You can also browse data while the scraper is running."), c.default.createElement("div", {
      className: "form-group"
    }, c.default.createElement("div", {
      className: "col-lg-offset-1 col-lg-10"
    }, c.default.createElement("button", {
      type: "button",
      className: "btn btn-primary",
      id: "submit-scrape-sitemap",
      onClick: l,
      disabled: e
    }, n)))));
  }));
},