/**
 * UI Component: AttributeAutocomplete
 * Source module ID: 79915
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

79915: function(e, t, r) {
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
  }), t.AttributeAutocomplete = void 0;
  const i = o(r(96540)),
    a = r(96540),
    s = r(14313),
    l = r(90330),
    c = r(84417),
    u = r(62677),
    d = r(57205),
    p = r(82226);
  t.AttributeAutocomplete = ({
    feature: e
  }) => {
    var t, r;
    const o = (0, l.useFormContext)(),
      [f, h] = (0, a.useState)([]),
      [m, g] = (0, a.useState)([]),
      v = o.watch("selector"),
      y = o.watch(e),
      b = (0,
        d.useSelectorBreadcrumb)(),
      w = (0, c.getValidationStatusClassName)(o.getFieldState(e)),
      S = (0,
        a.useCallback)((() => n(void 0, void 0, void 0, (function*() {
        const e = b[b.length - 1],
          t = p.appState.sitemap.getSelectorById(e);
        let r;
        t && t.willReturnElements() && (r = yield u.DevToolsContentScriptClient.getElement(t.selector));
        const n = yield u.DevToolsContentScriptClient.getElement(v, r);
        if (null === n) return [];
        const o = yield u.DevToolsContentScriptClient.getAllAttributes(n), i = [];
        for (const e in o) "" !== o[e] && null !== o[e] && i.push(e);
        return i;
      }))), [v, b, p.appState.sitemap]),
      x = (0, a.useCallback)((() => n(void 0, void 0, void 0, (function*() {
        const e = yield S();
        h(e);
      }))), [S]);
    return (0, a.useEffect)((() => {
      (() => {
        if (o.getFieldState(e).isDirty && y.length > 0) {
          const e = new RegExp(`^${y}`, "i"),
            t = f.sort().filter((t => e.test(t)));
          g(t);
        } else g(f);
      })();
    }), [f, y]), i.default.createElement("div", {
      className: `form-group ${w}`
    }, i.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, "Attribute name"), i.default.createElement("div", {
      className: "col-lg-10"
    }, i.default.createElement("input", Object.assign({
      id: e,
      className: "form-control",
      type: "text",
      placeholder: "Click to view available attributes"
    }, o.register(e, {
      onBlur: () => {
        setTimeout((() => g([])), 100);
      }
    }), {
      onClick: x
    })), i.default.createElement("div", {
      className: "autocomplete-dropdown"
    }, m && m.length > 0 && i.default.createElement("ul", {
      className: "dropdown-menu dropdown-menu-left autocomplete-suggestions-dropdown"
    }, m.map((t => i.default.createElement("li", {
      className: "autocomplete-suggestion",
      key: t,
      onMouseDown: () => {
        return r = t, void o.setValue(e, r, {
          shouldValidate: !0
        });
        var r;
      }
    }, t))))), i.default.createElement(s.ValidationError, {
      field: "extractAttribute",
      message: null === (r = null === (t = o.formState.errors) || void 0 === t ? void 0 : t.extractAttribute) || void 0 === r ? void 0 : r.message
    })));
  };
},