(function() {
  const mainTab = document.getElementById("wsTabMain");
  const reviewsTab = document.getElementById("wsTabTkReviews");
  const mainPanel = document.getElementById("wsPanelMain");
  const reviewsPanel = document.getElementById("wsPanelTkReviews");

  function activate(target) {
    const isReviews = target === "reviews";
    mainTab.classList.toggle("active", !isReviews);
    reviewsTab.classList.toggle("active", isReviews);
    mainPanel.classList.toggle("active", !isReviews);
    reviewsPanel.classList.toggle("active", isReviews);
  }

  mainTab.addEventListener("click", () => activate("main"));
  reviewsTab.addEventListener("click", () => activate("reviews"));
})();
