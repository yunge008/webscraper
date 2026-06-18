/**
 * UI Component: DeletionConfirmationModal
 * Source module ID: 49876
 * Extracted from: devtools_panel.js (Web Scraper v1.107.22)
 * Framework: React (MUI components)
 */

49876: function(e, t, r) {
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
  }), t.DeletionConfirmationModal = void 0;
  const i = r(44015),
    a = o(r(96540)),
    s = r(96540),
    l = o(r(74692)),
    c = r(82226);
  t.DeletionConfirmationModal = (0, i.observer)((e => {
    const t = c.appState.deletionConfirmationModalVisible;
    let r;
    (0, s.useEffect)((() => {
      t && (0, l.default)(r).modal("show"), (0, l.default)(r).modal().on("hidden.bs.modal", (() => {
        c.appState.updateDeletionConfirmationModalVisible(!1);
      }));
    }));
    const o = () => {
      (0, l.default)(r).modal("hide"), c.appState.updateDeletionConfirmationModalVisible(!1);
    };
    return t ? a.default.createElement("div", {
      ref: e => r = e,
      className: "modal fade deletion-confirmation-modal"
    }, a.default.createElement("div", {
      className: "modal-dialog"
    }, a.default.createElement("div", {
      className: "modal-content"
    }, a.default.createElement("div", {
      className: "modal-header"
    }, a.default.createElement("button", {
      type: "button",
      className: "close",
      onClick: o
    }, "\xd7"), a.default.createElement("h4", {
      className: "modal-title"
    }, "Delete Confirmation")), a.default.createElement("div", {
      className: "modal-body"
    }, a.default.createElement("p", null, e.confirmationText)), a.default.createElement("div", {
      className: "modal-footer"
    }, a.default.createElement("button", {
      type: "button",
      className: "btn btn-default cancel-confirmation-modal",
      "data-dismiss": "modal",
      "aria-hidden": "true"
    }, "Cancel"), a.default.createElement("button", {
      type: "button",
      className: "btn btn-danger delete-confirmation",
      onClick: () => n(void 0, void 0, void 0, (function*() {
        o(), yield e.performDeletion();
      }))
    }, "Delete"))))) : a.default.createElement(a.default.Fragment, null);
  }));
},