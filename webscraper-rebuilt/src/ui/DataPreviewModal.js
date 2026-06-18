/**
 * UI Component: DataPreviewModal
 * Source module ID: 30864
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

30864: function(e, t, r) {
  "use strict";
  var n = this && this.__importDefault || function(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  };
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), t.DataPreviewModal = void 0;
  const o = n(r(74692)),
    i = r(44015),
    a = n(r(96540)),
    s = r(96540),
    l = r(74447),
    c = r(82226);
  t.DataPreviewModal = (0, i.observer)((() => {
    let e;
    const t = () => {
      c.appState.updateDataPreviewData(void 0);
    };
    if ((0, s.useEffect)((() => {
        void 0 !== c.appState.getDataPreviewData() && (0, o.default)(e).modal("show"), (0,
          o.default)(e).modal().on("hidden.bs.modal", (() => {
          t();
        }));
      })), void 0 === c.appState.dataPreviewData) return a.default.createElement("div", null);
    const r = {
      height: (0, o.default)(window).height() - 120 + "px"
    };
    return a.default.createElement("div", {
      ref: t => e = t,
      className: "modal fade data-preview-modal"
    }, a.default.createElement("div", {
      className: "modal-dialog"
    }, a.default.createElement("div", {
      className: "modal-content"
    }, a.default.createElement("div", {
      className: "modal-header"
    }, a.default.createElement("button", {
      type: "button",
      className: "close",
      "data-dismiss": "modal",
      "aria-hidden": "true",
      onClick: t
    }, "\xd7"), a.default.createElement("h4", {
      className: "modal-title"
    }, "Data Preview")), a.default.createElement("div", {
      className: "modal-body",
      style: r
    }, a.default.createElement(l.DataPreviewTable, {
      data: c.appState.dataPreviewData
    })))));
  }));
},