/**
 * Module: WebsiteStateSetup
 * Source module ID: 49927
 * Category: utils
 * Extracted from: background_script.js (Web Scraper v1.107.22)
 * 
 * NOTE: Variable names have been preserved from the minified bundle.
 * This is the extracted and formatted source for modification purposes.
 */

49927: function(e, t, r) {
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
  }), t.WebsiteStateSetup = void 0;
  const i = r(83258),
    o = r(94606),
    s = r(70259),
    a = r(789);
  class l {
    static runActions(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        for (const n of e) switch (n.type) {
          case "openUrl":
            yield l.openUrl(t, n.url);
            break;

          case "input":
          case "textInput":
          case "passwordInput":
            yield l.fieldInput(t, n.selector, n.value, r);
            break;

          case "click":
            yield l.click(t, n.selector, r);
            break;

          case "sleep":
            yield l.sleep(n.duration);
        }
      }));
    }
    static foundEmptyPasswordField(e) {
      if (!e || !e.enabled) return !1;
      const {
        actions: t
      } = e;
      for (const e of t)
        if ("passwordInput" === e.type && a.Str.isEmpty(e.value)) return !0;
      return !1;
    }
    static openUrl(e, t) {
      return n(this, void 0, void 0, (function*() {
        yield e.openPage(t, {
          failOnCaptcha: !1
        }), yield i.Async.sleep(2 * s.TIME.ONE_SECOND_MS);
      }));
    }
    static fieldInput(e, t, r, i) {
      return n(this, void 0, void 0, (function*() {
        const n = yield e.getElement(t, i);
        if (null === n) throw `STATE_SETUP_ERROR State setup couldn't find input field - ${t}`;
        yield n.type(r), yield n.waitForPageLoadComplete(2 * s.TIME.ONE_SECOND_MS);
      }));
    }
    static click(e, t, r) {
      return n(this, void 0, void 0, (function*() {
        const n = yield e.getElement(t, r);
        if (null === n) throw `STATE_SETUP_ERROR State setup couldn't find button - ${t}`;
        yield n.click(o.ClickActionTypes.real), yield n.waitForPageLoadComplete(2 * s.TIME.ONE_SECOND_MS);
      }));
    }
    static sleep(e) {
      return n(this, void 0, void 0, (function*() {
        yield i.Async.sleep(e);
      }));
    }
  }
  t.WebsiteStateSetup = l;
},