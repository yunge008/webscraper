/**
 * Module: Log
 * Source module ID: 74161
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

74161: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Log = void 0;
  const i = r(62147),
    o = n(r(61160)),
    s = r(39153),
    a = r(72382),
    l = r(70259);
  class c {
    constructor(e) {
      this.receivedNotExpectedMessages = [], this.loggingLevel = i.loggingLevels.Info,
        this.expectedMessages = [], this.notExpectedMessages = [], this.ignoreMessages = !1,
        this.failOnLog = !1, this.receivedErrorsOrWarnings = [], this.profilingEnabled = !1,
        this.prefixText = e.prefixText || "", "object" == typeof process ? this.defaultLogSource = "win32" === process.platform ? a.LogSource.ExternalChromeManagementServer : a.LogSource.Node : this.defaultLogSource = a.LogSource.ScraperConsole;
    }
    initTimeStarted() {
      this.timeStarted = Date.now();
    }
    setScrapingJobId(e) {
      this.scrapingJobId = e;
    }
    setTaskTrackerName(e) {
      this.taskTrackerName = e;
    }
    setUserId(e) {
      this.userId = e;
    }
    setProxyConfig(e) {
      this.proxyId = e;
    }
    setOrganizationId(e) {
      this.organizationId = e;
    }
    setSitemapId(e) {
      this.sitemapId = e;
    }
    setFailedRetryCounter(e) {
      this.failedRetries = e;
    }
    setEmptyRetryCounter(e) {
      this.emptyRetries = e;
    }
    setSharedSitemapHash(e) {
      this.sharedSitemapHash = e;
    }
    setMochaWorkerId(e) {
      this.mochaWorkerId = e;
    }
    log(e, t, r, n, i = this.defaultLogSource) {
      var s;
      n || (n = Math.round(Date.now() / l.TIME.ONE_SECOND_MS));
      const a = null !== (s = r.url) && void 0 !== s ? s : this.url;
      let c;
      if (void 0 !== a) {
        c = (0, o.default)(a).hostname;
      }
      r = Object.assign({
        timestamp: n,
        level_name: e,
        message: t,
        scrapingJobId: this.scrapingJobId,
        taskTrackerName: this.taskTrackerName,
        userId: this.userId,
        organizationId: this.organizationId,
        sitemapId: this.sitemapId,
        failedRetries: this.failedRetries,
        emptyRetries: this.emptyRetries,
        sharedSitemapHash: this.sharedSitemapHash,
        proxyId: this.proxyId,
        runTime: this.getRunTime(),
        MOCHA_WORKER_ID: this.mochaWorkerId,
        logSource: i,
        url: a,
        domainName: c
      }, r);
      const u = JSON.stringify(r, ((e, t) => ("string" == typeof t && t.length > 1e4 && (t = t.slice(0, 1e4)),
        t)));
      "ERROR" === e || "WARNING" === e ? (console.error(u), this.failOnLog && !this.isMessageExpected(e, t) && this.receivedErrorsOrWarnings.push(r)) : console.log(u),
        this.isMessageNotExpected(e, t) && this.receivedNotExpectedMessages.push(t), this.failOnLog && this.removeExpectedMessage(e, t);
    }
    error(e, t = {}) {
      this.canLog(i.loggingLevels.Error) && (t.stack || (t.stack = (new Error).stack),
        this.log("ERROR", e, t));
    }
    info(e, t = {}) {
      this.canLog(i.loggingLevels.Info) && this.log("INFO", e, t);
    }
    debug(e, t = {}) {
      this.canLog(i.loggingLevels.Debug) && this.log("DEBUG", e, t);
    }
    warning(e, t = {}) {
      this.canLog(i.loggingLevels.Warning) && (t.stack || (t.stack = (new Error).stack),
        this.log("WARNING", e, t));
    }
    notice(e, t = {}) {
      this.canLog(i.loggingLevels.Notice) && this.log("NOTICE", e, t);
    }
    getLogger(e) {
      e.prefixText = this.prefixText + (e.prefixText || ""), e.profilingEnabled = e.profilingEnabled || this.profilingEnabled;
      return new c(e);
    }
    setUrl(e) {
      this.url = e;
    }
    copyMessage(e, t) {
      this.log(e.level_name, e.message, e, e.timestamp, t);
    }
    logAcceptChHeaderValues(e) {
      if (e)
        for (const r of e) "accept-ch" === r.name.toLowerCase() && t.Log.debug("Accept-CH header received", {
          values: r.value
        }), "critical-ch" === r.name.toLowerCase() && t.Log.notice("Critical-CH header received", {
          values: r.value
        });
    }
    expectError(e) {
      this.expectedMessages.push({
        severity: "ERROR",
        message: e
      });
    }
    expectWarning(e) {
      this.expectedMessages.push({
        severity: "WARNING",
        message: e
      });
    }
    expectNotice(e) {
      this.expectedMessages.push({
        severity: "NOTICE",
        message: e
      });
    }
    notExpectNotice(e) {
      this.notExpectedMessages.push({
        severity: "NOTICE",
        message: e
      });
    }
    expectInfo(e) {
      this.expectedMessages.push({
        severity: "INFO",
        message: e
      });
    }
    hasReceivedAllExpectedLogs() {
      const e = this.expectedMessages;
      return this.expectedMessages = [], 0 === e.length;
    }
    getReceivedErrorsOrWarnings() {
      return this.ignoreMessages ? [] : this.receivedErrorsOrWarnings;
    }
    clearExpectedMessages() {
      this.expectedMessages = [];
    }
    clearNotExpectedMessages() {
      this.notExpectedMessages = [], this.receivedNotExpectedMessages = [];
    }
    clearIgnoreMessages() {
      this.ignoreMessages = !1;
    }
    clearReceivedErrorOrWarning() {
      this.receivedErrorsOrWarnings = [];
    }
    ignoreReceivedMessages() {
      this.ignoreMessages = !0;
    }
    setFailOnLog() {
      this.failOnLog = !0;
    }
    setLoggingLevel(e) {
      switch (e) {
        case "error":
          this.loggingLevel = i.loggingLevels.Error;
          break;

        case "warning":
          this.loggingLevel = i.loggingLevels.Warning;
          break;

        case "notice":
          this.loggingLevel = i.loggingLevels.Notice;
          break;

        case "info":
          this.loggingLevel = i.loggingLevels.Info;
          break;

        case "debug":
          this.loggingLevel = i.loggingLevels.Debug;
      }
    }
    handleErrorAsNotice(e) {
      this.notice(s.Err.getMessage(e));
    }
    handleErrorAsWarning(e) {
      this.warning(s.Err.getMessage(e));
    }
    handleErrorAsError(e) {
      this.error(s.Err.getMessage(e));
    }
    clearProperties() {
      delete this.scrapingJobId, delete this.url, delete this.timeStarted, delete this.sharedSitemapHash,
        delete this.emptyRetries, delete this.userId, delete this.organizationId, delete this.taskTrackerName,
        delete this.sitemapId, delete this.failedRetries, delete this.proxyId;
    }
    isMessageExpected(e, t) {
      for (const r of this.expectedMessages)
        if (e === r.severity && t === r.message) return !0;
      return !1;
    }
    isMessageNotExpected(e, t) {
      for (const r of this.notExpectedMessages)
        if (e === r.severity && t === r.message) return !0;
      return !1;
    }
    removeExpectedMessage(e, t) {
      for (let r = 0; r < this.expectedMessages.length; r++) {
        const n = this.expectedMessages[r];
        if (e === n.severity && t === n.message) return void this.expectedMessages.splice(r, 1);
      }
    }
    canLog(e) {
      return this.loggingLevel >= e;
    }
    getRunTime() {
      return this.timeStarted ? Math.round((Date.now() - this.timeStarted) / l.TIME.ONE_SECOND_MS) : 0;
    }
  }
  t.Log = new c({});
},