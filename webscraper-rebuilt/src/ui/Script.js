/**
 * UI Component: Script
 * Source module ID: 86458
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

86458: function(e, t, r) {
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
    s = this && this.__importDefault || function(e) {
      return e && e.__esModule ? e : {
        default: e
      };
    };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.Script = void 0;
  const l = a(r(96540)),
    c = s(r(26069)),
    u = r(28848),
    d = r(90330);
  t.Script = ({}) => {
    const {
      register: e,
      watch: t
    } = (0, d.useFormContext)(), r = t("script") || "", n = (0,
      l.useCallback)((t => e("script").onChange({
      type: "change",
      target: {
        value: t,
        name: "script"
      }
    })), [e]);
    return l.default.createElement("div", {
      className: "form-group"
    }, l.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, "Script"), l.default.createElement("div", {
      className: "col-lg-10"
    }, l.default.createElement("div", {
      className: "script-editor"
    }, l.default.createElement("span", null, "function script(parentElement: Element | Document) : Promise<Object[]> | Object[] {"), l.default.createElement(c.default, {
      value: r,
      onValueChange: n,
      className: "script-input",
      highlight: e => (0, u.highlight)(e, u.languages.javascript, "javascript"),
      padding: 10,
      style: {
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12
      }
    }), l.default.createElement("span", null, "}"))));
  };
},