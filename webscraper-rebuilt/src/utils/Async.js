/**
 * Module: Async
 * Source module ID: 83258
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

83258: function(e, t, r) {
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
  }), t.Async = void 0;
  const i = r(74161),
    o = r(26180),
    s = r(67849),
    a = r(70259);
  class l {
    static sleep(e) {
      return n(this, void 0, void 0, (function*() {
        return new Promise((t => setTimeout(t, e)));
      }));
    }
    static sleepDifference(e, t) {
      return n(this, void 0, void 0, (function*() {
        const r = new s.TimeoutCounter(t, e);
        if (r.isTimedOut()) i.Log.info("will not be sleeping for additional time");
        else {
          const e = r.timeLeft();
          i.Log.info(`will be sleeping for additional ${e}`), yield r.sleep();
        }
      }));
    }
    static timeoutPromise(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        let n;
        const i = [new Promise(((e, i) => {
          n = setTimeout((() => {
            i(new o.TimeoutError(`timeout: ${r}`));
          }), t);
        })), e];
        try {
          return yield Promise.race(i).then((e => (clearTimeout(n), e)));
        } catch (e) {
          throw clearTimeout(n), e;
        }
      }));
    }
    static timeoutPromiseWithoutTimeoutError(e, t, r) {
      return n(this, arguments, void 0, (function*(e, t, r, n = "NOTICE") {
        let o;
        const s = [new Promise((e => {
          o = setTimeout((() => {
            i.Log.log(n, "request timed out. continuing", {
              error: r
            }), e();
          }), t);
        })), e];
        try {
          return yield Promise.race(s).then((e => (clearTimeout(o), e)));
        } catch (e) {
          throw clearTimeout(o), e;
        }
      }));
    }
    static waitForCallback(e, t) {
      return n(this, arguments, void 0, (function*(e, t, r = a.TIME.ONE_SECOND_MS) {
        const n = new s.TimeoutCounter(r);
        for (;;) {
          yield l.sleep(10);
          const r = yield e();
          if (r) return r;
          if (n.isTimedOut()) throw new Error(`Wait for callback timeout: ${t}`);
        }
      }));
    }
    static waitForCallbackWithoutError(e) {
      return n(this, arguments, void 0, (function*(e, t = a.TIME.ONE_SECOND_MS) {
        const r = new s.TimeoutCounter(t);
        for (;;) {
          yield l.sleep(10);
          const t = yield e();
          if (t) return t;
          if (r.isTimedOut()) return t;
        }
      }));
    }
    static retryCallback(e, t) {
      return n(this, arguments, void 0, (function*(e, t, r = []) {
        var n;
        let i = 0;
        for (; i < t;) {
          i++;
          try {
            return yield e();
          } catch (e) {
            if (i === t) throw e;
            for (const t of r)
              if (null === (n = e.stack) || void 0 === n ? void 0 : n.includes(t)) throw e;
          }
        }
      }));
    }
  }
  t.Async = l;
},