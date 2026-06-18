/**
 * Module: BackgroundScript
 * Source module ID: 72939
 * Category: background
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

72939: function(e, t, r) {
  "use strict";
  var n = this && this.__awaiter || function(e, t, r, n) {
      return new(r || (r = Promise))((function(i, o) {
        function s(e) {
          try {
            l(n.next(e));
          } catch (e) {
            o(e);
          }
        }

        function a(e) {
          try {
            l(n.throw(e));
          } catch (e) {
            o(e);
          }
        }

        function l(e) {
          var t;
          e.done ? i(e.value) : (t = e.value, t instanceof r ? t : new r((function(e) {
            e(t);
          }))).then(s, a);
        }
        l((n = n.apply(e, t || [])).next());
      }));
    },
    i = this && this.__asyncValues || function(e) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var t, r = e[Symbol.asyncIterator];
      return r ? r.call(e) : (e = "function" == typeof __values ? __values(e) : e[Symbol.iterator](),
        t = {}, n("next"), n("throw"), n("return"), t[Symbol.asyncIterator] = function() {
          return this;
        }, t);

      function n(r) {
        t[r] = e[r] && function(t) {
          return new Promise((function(n, i) {
            (function(e, t, r, n) {
              Promise.resolve(n).then((function(t) {
                e({
                  value: t,
                  done: r
                });
              }), t);
            })(n, i, (t = e[r](t)).done, t.value);
          }));
        };
      }
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.BackgroundScript = void 0;
  const o = r(52507),
    s = r(74161),
    a = r(45431),
    l = r(80813),
    c = r(46715),
    u = r(67043),
    d = r(45333),
    h = r(28760),
    f = r(44852),
    p = r(25450),
    m = r(93987),
    g = r(70259),
    v = r(49927),
    y = r(72328),
    b = r(90042),
    w = r(70905),
    _ = r(75736),
    S = r(40850),
    x = r(78202),
    E = r(36385),
    C = r(66100),
    T = r(78079),
    k = r(39153),
    O = r(71562),
    L = r(1392),
    D = r(67369),
    R = r(54886),
    A = r(5886),
    I = r(59944),
    P = r(73350),
    N = r(67068),
    F = r(66512),
    M = r(75043),
    j = r(83258),
    B = r(69536);
  t.BackgroundScript = class {
    sendToContentScript(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        const n = {
          method: t,
          params: r
        };
        return p.ChromeTab.sendMessage(e, n);
      }));
    }
    init() {
      return n(this, void 0, void 0, (function*() {
        this.defineGlobalStorage(), S.FirstTimeInstall.init(), O.ExtensionUpdate.init(),
          this.initMessageListener(), D.ExternalMessageService.init();
        try {
          yield l.Stats.report(), yield this.initUninstallSurvey();
        } catch (e) {
          s.Log.error("stat/survey client init error", {
            error: e.toString()
          });
        }
        yield N.BrowserAction.init();
      }));
    }
    ping(e) {
      return n(this, void 0, void 0, (function*() {
        return `${e} pong`;
      }));
    }
    injectContentScript(e) {
      return n(this, void 0, void 0, (function*() {
        yield P.ContentScriptLoader.injectContentScript(e);
      }));
    }
    incrementDailyStat(e, t) {
      return n(this, void 0, void 0, (function*() {
        yield l.Stats.incrementDailyStatKey(e, t);
      }));
    }
    setDailyStat(e, t) {
      return n(this, void 0, void 0, (function*() {
        yield l.Stats.updateDailyStatKey(e, t);
      }));
    }
    updateExtensionIsBeingUsed(e) {
      return n(this, void 0, void 0, (function*() {
        yield l.Stats.updateExtensionIsBeingUsed(e);
      }));
    }
    initMessageListener() {
      s.Log.info("initializing Background Script message listener"), chrome.runtime.onMessage.addListener(((e, t, r) => {
        let n;
        if ("BACKGROUND_SCRIPT".toString(), "getTabId" !== e.method) {
          try {
            this[e.method].apply(this, e.params).then((e => {
              r(e = {
                success: !0,
                response: e
              });
            })).catch((e => {
              n = {
                success: !1,
                error: e.toString()
              }, r(n);
            }));
          } catch (e) {
            n = {
              success: !1,
              error: e.toString()
            }, r(n);
          }
          return !0;
        }
        r({
          success: !0,
          response: t.tab.id
        });
      }));
    }
    sitemapExists(e) {
      return n(this, void 0, void 0, (function*() {
        return (new y.SitemapRepository).exists(e);
      }));
    }
    createSitemap(e) {
      return n(this, void 0, void 0, (function*() {
        const t = new y.SitemapRepository;
        yield t.create(e);
      }));
    }
    deleteSitemap(e) {
      return n(this, void 0, void 0, (function*() {
        const t = new y.SitemapRepository;
        yield t.delete(e);
      }));
    }
    getSitemap(e) {
      return n(this, void 0, void 0, (function*() {
        const t = new y.SitemapRepository;
        return !(yield t.exists(e)) && (yield this.getSitemapSyncEnabled()) && (yield this.downloadSitemap(e)),
          t.get(e);
      }));
    }
    updateSitemap(e) {
      return n(this, void 0, void 0, (function*() {
        const t = new y.SitemapRepository;
        yield t.update(e);
      }));
    }
    getDataPreviewData(e, t) {
      return n(this, void 0, void 0, (function*() {
        const r = new a.Sitemap(t.sitemap),
          n = t.selectorPath[t.selectorPath.length - 1],
          i = yield this.getDevtoolsWebPage(e), s = yield i.getRootElement(), l = yield s.getParentElement(r, t.selectorPath), c = new o.DataExtractor(l, n, r, {
            dataExtractorTimeout: 2 * g.TIME.ONE_HOUR_MS,
            deduplicateFirstPageData: "dataPreview"
          });
        let u;
        if (t.selectorId) {
          const e = r.getSelectorById(t.selectorId);
          u = yield c.getSelectorData(t.selectorId, e, l);
        } else u = yield c.getData();
        for (const e of u) delete e._deduplicateFirstPageData;
        i.deInitMixins(), u = T.TypeTransformer.undefinedToEmptyString(u);
        return new F.SelectorDataParser(r, t.selectorPath, t.selectorId).parseData(u);
      }));
    }
    performSelectorAction(e, t) {
      return n(this, void 0, void 0, (function*() {
        var r, n, o, s;
        const l = new a.Sitemap(t.sitemap),
          c = yield this.getDevtoolsWebPage(e), u = yield c.getRootElement(), d = l.getSelectorById(t.selectorId);
        try {
          for (var h, f = !0, p = i(d.getData(u)); !(r = (h = yield p.next()).done); f = !0) s = h.value,
            f = !1, ({} = s);
        } catch (e) {
          n = {
            error: e
          };
        } finally {
          try {
            f || r || !(o = p.return) || (yield o.call(p));
          } finally {
            if (n) throw n.error;
          }
        }
      }));
    }
    performWebsiteStateSetupActions(e, t) {
      return n(this, void 0, void 0, (function*() {
        const r = yield this.getDevtoolsWebPage(e);
        yield v.WebsiteStateSetup.runActions(t.actions, r, 10 * g.TIME.ONE_SECOND_MS);
      }));
    }
    getSitemapXmlLinksFromRobotsTxt(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield this.getDevtoolsWebPage(e), r = yield t.getRootElement(), n = new d.RobotsTxt;
        return yield n.getSitemapXmlLinksFromRobotsTxt(r);
      }));
    }
    scrape(e) {
      return n(this, void 0, void 0, (function*() {
        const t = yield w.ChromeWindow.create({
          url: chrome.runtime.getURL(`scraper.html?sitemapId=${encodeURIComponent(e.sitemap._id)}&requestInterval=${e.requestInterval}&pageLoadDelay=${e.pageLoadDelay}`)
        });
        let r = !0;
        for (; r;) yield j.Async.sleep(100), r = yield w.ChromeWindow.exists(t.id);
      }));
    }
    storeSitemapData(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        const n = new _.SitemapDataRepository(e);
        yield n.destroy();
        const i = B.SitemapDataTransformer.populateDataPreviewData(t, r);
        return n.createMany(i);
      }));
    }
    deleteSitemapData(e) {
      return n(this, void 0, void 0, (function*() {
        return new _.SitemapDataRepository(e).destroy();
      }));
    }
    getSitemapMetadata() {
      return n(this, void 0, void 0, (function*() {
        const e = new y.SitemapRepository;
        let t = yield e.getAllMetadata();
        return t;
      }));
    }
    getSitemapSyncEnabled() {
      return n(this, void 0, void 0, (function*() {
        return !1;
      }));
    }
    downloadSitemap(e) {
      return n(this, void 0, void 0, (function*() {
        throw new Error("Cloud sync is disabled in this rebuilt extension.");
      }));
    }
    uploadSitemap(e) {
      return n(this, void 0, void 0, (function*() {
        throw new Error("Cloud sync is disabled in this rebuilt extension.");
      }));
    }
    disconnectFromCloud() {
      return n(this, void 0, void 0, (function*() {
        yield h.CloudAuthenticationService.removeToken();
      }));
    }
    openSitemapSyncPage(e) {
      return n(this, void 0, void 0, (function*() {
        throw new Error("Cloud auth is disabled in this rebuilt extension.");
      }));
    }
    openUrlInNewTab(e) {
      return n(this, void 0, void 0, (function*() {
        yield p.ChromeTab.create({
          active: !0,
          url: e
        });
      }));
    }
    goToUrl(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        const n = yield p.ChromeTab.get(e), i = new L.ChromeClient({
          tabId: e,
          windowId: n.windowId,
          pageLoadDelay: null != r ? r : 50,
          failOnErrorPages: !1,
          reloadPageBeforeHashTagChange: !0,
          waitAjaxDomains: []
        });
        yield i.init();
        try {
          yield i.openPage(t);
        } catch (e) {
          s.Log.notice("wait for page load failed ", {
            error: k.Err.getMessage(e)
          });
        }
        i.deInitMixins();
      }));
    }
    startInterceptingRequests(e) {
      return n(this, void 0, void 0, (function*() {
        this.tabNetworkRequestListener || (this.tabNetworkRequestListener = new M.TabNetworkRequestListener),
          yield this.tabNetworkRequestListener.startListening(e);
      }));
    }
    stopInterceptingRequests() {
      return n(this, void 0, void 0, (function*() {
        this.tabNetworkRequestListener && this.tabNetworkRequestListener.stopListening();
      }));
    }
    getInterceptedRequestResponses(e) {
      return n(this, void 0, void 0, (function*() {
        return this.tabNetworkRequestListener ? this.tabNetworkRequestListener.replayInterceptedRequests(e) : [];
      }));
    }
    handleFirefoxAuthMessage(e) {
      return n(this, void 0, void 0, (function*() {
        return D.ExternalMessageService.handleFirefoxMessage(e);
      }));
    }
    reportDataPreview(e, t, r, i, o, s) {
      return n(this, void 0, void 0, (function*() {
        (yield b.Config.get("experimentalFeaturesEnabled")) && (yield m.DataPreviewReporter.postDataPreview(e, t, r, i, o, s));
      }));
    }
    defineGlobalStorage() {
      self.LocalForageDb = x.LocalForageDb, self.SitemapRepository = y.SitemapRepository,
        self.SitemapDataRepository = _.SitemapDataRepository, self.ChromeStorageLocal = E.ChromeStorageLocal,
        self.StatsRepository = C.StatsRepository;
    }
    isAccessible(e) {
      return n(this, void 0, void 0, (function*() {
        return p.ChromeTab.isAccessible(e);
      }));
    }
    generateSelectorsV2(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        const n = `${I.API_BASE_URL}/generateSelectors/v2/single`;
        return (yield R.HttpRequest.post(n, {
          input: e,
          wrapperHTML: t,
          existingSelectorIds: r
        }, {
          withCredentials: !1
        })).selectors;
      }));
    }
    generateSelectors(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        const n = `${I.API_BASE_URL}/generateSelectors${r === A.WizardPageType.singleRecordFromMultiplePages ? "/single" : ""}`,
          i = yield R.HttpRequest.post(n, {
            html: e,
            pageUrl: t
          }, {
            withCredentials: !1
          });
        return JSON.parse(i);
      }));
    }
    automateInCloud(e) {
      return n(this, void 0, void 0, (function*() {
        throw new Error("Cloud automation is disabled in this rebuilt extension.");
      }));
    }
    updateLocalSitemap(e) {
      return n(this, void 0, void 0, (function*() {
        const t = new y.SitemapRepository,
          r = yield t.get(e._id);
        if (e.websiteStateSetup)
          for (const t of e.websiteStateSetup.actions)
            if (("passwordInput" === t.type || "input" === t.type) && "" === t.value) {
              const e = r.websiteStateSetup.actions.find((e => e.type === t.type && e.selector === t.selector));
              e && (t.value = e.value);
            }
        yield t.update(e);
      }));
    }
    initUninstallSurvey() {
      return n(this, void 0, void 0, (function*() {
        const e = yield l.Stats.getTimeInstalled();
        yield u.UninstallSurvey.uninstall(e);
      }));
    }
    getDevtoolsWebPage(e) {
      return n(this, void 0, void 0, (function*() {
        const t = (yield p.ChromeTab.get(e)).windowId,
          r = new c.WebPageChromeTab;
        return yield r.launch({
          tabId: e,
          windowId: t,
          pageLoadDelay: 2 * g.TIME.ONE_SECOND_MS
        }), yield r.setNetworkListenerPageAlmostLoaded(), r;
      }));
    }
  };
},
