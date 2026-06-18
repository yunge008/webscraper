/**
 * Module: Stats
 * Source module ID: 80813
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

80813: function(e, t, r) {
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
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Stats = void 0;
  const i = r(45431),
    o = r(90042),
    s = r(67849),
    a = r(75736),
    l = r(70259),
    c = r(54886),
    u = r(39153),
    d = r(66100),
    h = r(72328),
    f = r(54644),
    p = r(789),
    m = r(36385);
  class g {
    static report() {
      return n(this, void 0, void 0, (function*() {
        if (!(yield o.Config.isDailyStatsEnabled())) return;
        const e = yield g.getLastTimeStatsReported();
        if (!s.TimeoutCounter.isTimedOut(g.reportInMs, e)) return;
        const t = Date.now();
        yield g.reportStats(), yield g.setLastTimeStatsReported(t), yield g.deleteStatsTillToday();
      }));
    }
    static updateDailyStatKey(e, t) {
      return n(this, void 0, void 0, (function*() {
        if (!(yield o.Config.isDailyStatsEnabled())) return;
        const r = yield g.getCurrentDateDailyStats();
        r[e] = t, yield g.updateDailyStats(r);
      }));
    }
    static incrementDailyStatKey(e) {
      return n(this, arguments, void 0, (function*(e, t = 1) {
        if (!(yield o.Config.isDailyStatsEnabled())) return;
        const r = yield g.getCurrentDateDailyStats();
        r[e] += t, yield g.updateDailyStats(r);
      }));
    }
    static updateExtensionIsBeingUsed(e) {
      return n(this, void 0, void 0, (function*() {
        if (!(yield o.Config.isDailyStatsEnabled())) return;
        const t = Date.now(),
          r = yield m.ChromeStorageLocal.get("lastTimeUsed");
        if (r) {
          if (Math.round((t - r) / l.TIME.ONE_SECOND_MS) < e / l.TIME.ONE_SECOND_MS) return;
        }
        yield m.ChromeStorageLocal.set("lastTimeUsed", t);
        const n = Math.round(e / 6e4);
        yield g.incrementDailyStatKey("webScraperUsageMinutes", n);
      }));
    }
    static getStatId() {
      return n(this, void 0, void 0, (function*() {
        if (!(yield o.Config.isDailyStatsEnabled())) return "";
        let e = yield m.ChromeStorageLocal.get("statId");
        return e || (e = p.Str.generateRandomStringOfLength(60), yield m.ChromeStorageLocal.set("statId", e)),
          e;
      }));
    }
    static getTimeInstalled() {
      return n(this, void 0, void 0, (function*() {
        if (!(yield o.Config.isDailyStatsEnabled())) return 0;
        const e = yield m.ChromeStorageLocal.get("timeInstalled");
        if (e) return e;
        const t = Math.floor(Date.now() / l.TIME.ONE_SECOND_MS);
        return yield m.ChromeStorageLocal.set("timeInstalled", t), t;
      }));
    }
    static deleteStatsTillToday() {
      return n(this, void 0, void 0, (function*() {
        const e = new d.StatsRepository,
          t = yield e.getAll();
        for (const e in t) g.isNotCurrentDate(t[e].date) && t.splice(Number(e), 1);
        yield e.destroy(), yield g.updateDailyStats(t[0]);
      }));
    }
    static getCurrentDateDailyStats() {
      return n(this, void 0, void 0, (function*() {
        const e = f.DateHelper.getDate(),
          t = yield g.getExtensionVersion(), r = new d.StatsRepository, n = yield r.get(e);
        if (!n) {
          return {
            _id: e,
            statId: yield g.getStatId(),
            date: e,
            extensionVersion: t,
            extensionId: chrome.runtime.id,
            scrapingJobsRun: 0,
            pagesScraped: 0,
            sitemapsCreated: 0,
            sitemapsDeleted: 0,
            sitemapsImported: 0,
            webScraperOpened: !1,
            webScraperUsageMinutes: 0
          };
        }
        return n;
      }));
    }
    static setLastTimeStatsReported(e) {
      return n(this, void 0, void 0, (function*() {
        yield m.ChromeStorageLocal.set("lastTimeReported", e);
      }));
    }
    static reportStats() {
      return n(this, void 0, void 0, (function*() {
        const e = yield g.getStats();
        try {
          yield c.HttpRequest.post("https://stats.webscraper.io/post-stats", {
            data: e
          });
        } catch (e) {
          throw new Error(`Failed to report stats: ${u.Err.getMessage(e)}`);
        }
      }));
    }
    static getDailyStats() {
      return n(this, void 0, void 0, (function*() {
        const e = new d.StatsRepository,
          t = yield e.getAll(), r = [];
        for (const e of t) g.isNotCurrentDate(e.date) && r.push(e);
        return r;
      }));
    }
    static isNotCurrentDate(e) {
      return e.match(/\d+\-\d+\-\d+/) && e !== f.DateHelper.getDate();
    }
    static updateDailyStats(e) {
      return n(this, void 0, void 0, (function*() {
        const t = new d.StatsRepository;
        yield t.create(e);
      }));
    }
    static getExtensionVersion() {
      return n(this, void 0, void 0, (function*() {
        return chrome.runtime.getManifest().version;
      }));
    }
    static getDatabaseStats() {
      return n(this, void 0, void 0, (function*() {
        const e = new h.SitemapRepository,
          t = (yield e.getAll()).map((e => new i.Sitemap(e))),
          r = yield g.getExtensionVersion(), n = {
            statId: yield g.getStatId(),
            sitemapCount: 0,
            extensionVersion: r,
            extensionId: chrome.runtime.id,
            selectorCountPerSitemap: {
              "1-1": 0,
              "2-5": 0,
              "6-10": 0,
              "11+": 0
            },
            startUrlCountPerSitemap: {
              "1-1": 0,
              "2-5": 0,
              "6-10": 0,
              "11-50": 0,
              "51-200": 0,
              "201-500": 0,
              "501-1000": 0,
              "1001-5000": 0,
              "5001+": 0
            },
            selectorUsageCount: {
              SelectorElement: 0,
              SelectorElementAttribute: 0,
              SelectorElementClick: 0,
              SelectorElementScroll: 0,
              SelectorGroup: 0,
              SelectorHTML: 0,
              SelectorImage: 0,
              SelectorLink: 0,
              SelectorPopupLink: 0,
              SelectorTable: 0,
              SelectorText: 0,
              SelectorSitemapXmlLink: 0,
              SelectorScriptData: 0,
              ActionScrollDown: 0,
              ActionClick: 0,
              SelectorPagination: 0
            },
            datasetSizes: {
              "1-1": 0,
              "2-5": 0,
              "6-10": 0,
              "11-50": 0,
              "51-200": 0,
              "201-500": 0,
              "501-1000": 0,
              "1001-5000": 0,
              "5001-10000": 0,
              "10001+": 0
            }
          };

        function o(e, t) {
          const r = {
            selectorCountPerSitemap: {
              "1-1": {
                min: 1,
                max: 1
              },
              "2-5": {
                min: 2,
                max: 5
              },
              "6-10": {
                min: 6,
                max: 10
              },
              "11+": {
                min: 1,
                max: 2147483647
              }
            },
            startUrlCountPerSitemap: {
              "1-1": {
                min: 1,
                max: 1
              },
              "2-5": {
                min: 2,
                max: 5
              },
              "6-10": {
                min: 6,
                max: 10
              },
              "11-50": {
                min: 11,
                max: 50
              },
              "51-200": {
                min: 51,
                max: 200
              },
              "201-500": {
                min: 201,
                max: 500
              },
              "501-1000": {
                min: 501,
                max: 1e3
              },
              "1001-5000": {
                min: 1e3,
                max: 5e3
              },
              "5001+": {
                min: 5001,
                max: 2147483647
              }
            },
            datasetSizes: {
              "1-1": {
                min: 1,
                max: 1
              },
              "2-5": {
                min: 2,
                max: 5
              },
              "6-10": {
                min: 6,
                max: 10
              },
              "11-50": {
                min: 11,
                max: 50
              },
              "51-200": {
                min: 51,
                max: 200
              },
              "201-500": {
                min: 201,
                max: 500
              },
              "501-1000": {
                min: 501,
                max: 1e3
              },
              "1001-5000": {
                min: 1e3,
                max: 5e3
              },
              "5001-10000": {
                min: 5001,
                max: 1e4
              },
              "10001+": {
                min: 10001,
                max: 2147483647
              }
            }
          };
          for (const i in r[e]) {
            const o = r[e][i];
            if (t >= o.min && t <= o.max) {
              n[e][i]++;
              break;
            }
          }
        }
        n.sitemapCount = t.length;
        for (const e of t) {
          o("selectorCountPerSitemap", e.selectors.length);
          for (const t of e.selectors) n.selectorUsageCount[t.type]++;
          o("startUrlCountPerSitemap", e.getStartUrls().length);
          const t = new a.SitemapDataRepository(e._id);
          o("datasetSizes", yield t.getCount());
        }
        return n;
      }));
    }
    static getStats() {
      return n(this, void 0, void 0, (function*() {
        return {
          databaseStats: yield g.getDatabaseStats(),
          dailyStats: yield g.getDailyStats()
        };
      }));
    }
    static getLastTimeStatsReported() {
      return n(this, void 0, void 0, (function*() {
        const e = yield m.ChromeStorageLocal.get("lastTimeReported");
        if (e) return e;
        const t = Date.now(),
          r = Math.round(t - Math.random() * g.randomFirstReportInMs);
        return yield g.setLastTimeStatsReported(r), t;
      }));
    }
  }
  t.Stats = g, g.reportInMs = 3 * l.TIME.ONE_DAY_MS, g.randomFirstReportInMs = 2 * l.TIME.ONE_DAY_MS;
},