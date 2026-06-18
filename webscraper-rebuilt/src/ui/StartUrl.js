/**
 * UI Component: StartUrl
 * Source module ID: 11717
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

11717: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.StartUrl = void 0;
  const o = n(r(96540)),
    i = r(14313),
    a = r(90330),
    s = r(84417);
  t.StartUrl = e => {
    var t, r;
    const {
      register: n,
      getFieldState: l,
      formState: {
        errors: c
      }
    } = (0, a.useFormContext)();
    return o.default.createElement("div", {
      className: `form-group start-url-block ${(0, s.getValidationStatusClassName)(l(`startUrl.${e.index}.startUrl`))}`
    }, o.default.createElement("label", {
      className: "col-lg-1 control-label"
    }, "Start URL ", e.index + 1), o.default.createElement("div", {
      className: "col-lg-10"
    }, o.default.createElement("div", {
      className: `input-group start-url-${e.index}`
    }, o.default.createElement("input", Object.assign({
      type: "text",
      "data-index": e.index
    }, n(`startUrl.${e.index}.startUrl`, {
      deps: "startUrl"
    }), {
      className: "form-control input-start-url",
      placeholder: "URL"
    })), o.default.createElement("span", {
      className: "input-group-btn"
    }, o.default.createElement("button", {
      className: "btn btn-default remove-start-url",
      type: "button",
      onClick: () => e.remove(e.index)
    }, "-"), o.default.createElement("button", {
      className: "btn btn-default add-start-url",
      type: "button",
      onClick: () => e.insert(e.index + 1, {
        startUrl: ""
      })
    }, "+"))), o.default.createElement(i.ValidationError, {
      field: `startUrl[${e.index}]`,
      message: null === (r = null === (t = c.startUrl) || void 0 === t ? void 0 : t[e.index]) || void 0 === r ? void 0 : r.startUrl.message
    })));
  };
},