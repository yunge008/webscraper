/**
 * UI Component: ItemLimit
 * Source module ID: 50869
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

50869: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.ItemLimit = void 0;
  const o = n(r(96540)),
    i = r(90330),
    a = r(14313),
    s = r(84417),
    l = {
      elementLimit: "Element limit",
      columnCount: "Column count"
    };
  t.ItemLimit = ({
    feature: e,
    disabled: t = !1,
    placeholder: r = "Unlimited"
  }) => {
    var n, c;
    const u = (0, i.useFormContext)(),
      d = (0, s.getValidationStatusClassName)(u.getFieldState(e)),
      p = l[e],
      f = t => {
        const r = t.target.value;
        u.setValue(e, "" === r ? 0 : r);
      };
    return o.default.createElement("div", {
      className: `form-group ${d}`
    }, o.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, p), o.default.createElement("div", {
      className: "col-lg-10"
    }, o.default.createElement(i.Controller, {
      name: e,
      control: u.control,
      disabled: t,
      render: t => {
        var n;
        return o.default.createElement("input", Object.assign({}, t.field, {
          id: e,
          type: "text",
          value: "0" === (null === (n = t.field.value) || void 0 === n ? void 0 : n.toString()) ? "" : t.field.value,
          onChange: f,
          placeholder: r,
          className: "form-control"
        }));
      }
    }), o.default.createElement(a.ValidationError, {
      field: e,
      message: null === (c = null === (n = u.formState.errors) || void 0 === n ? void 0 : n[e]) || void 0 === c ? void 0 : c.message.toString()
    })));
  };
},