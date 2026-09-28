(function() {
  const mainTab = document.getElementById("wsTabMain");
  const reviewsTab = document.getElementById("wsTabTkReviews");
  const mainPanel = document.getElementById("wsPanelMain");
  const reviewsPanel = document.getElementById("wsPanelTkReviews");
  const diagnosticsTab = document.getElementById("wsTabDiagnostics");
  const diagnosticsPanel = document.getElementById("wsPanelDiagnostics");

  function activate(target) {
    for (const [name, tab, panel] of [["main", mainTab, mainPanel], ["reviews", reviewsTab, reviewsPanel], ["diagnostics", diagnosticsTab, diagnosticsPanel]]) {
      tab.classList.toggle("active", target === name);
      panel.classList.toggle("active", target === name);
    }
    if (target === "diagnostics") document.getElementById("tkDiagnosticsFrame").contentWindow.postMessage("tk-diagnostics-visible", location.origin);
  }

  mainTab.addEventListener("click", () => activate("main"));
  reviewsTab.addEventListener("click", () => activate("reviews"));
  diagnosticsTab.addEventListener("click", () => activate("diagnostics"));
})();
