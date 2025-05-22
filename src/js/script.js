document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    const button = dropdown.querySelector(".dropdown-button");
    const content = dropdown.querySelector(".dropdown-content");

    if (!button || !content) return;

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = content.style.display === "block";
      document.querySelectorAll(".dropdown-content").forEach((c) => {
        c.style.display = "none";
      });
      content.style.display = isVisible ? "none" : "block";
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-content").forEach((c) => {
      c.style.display = "none";
    });
  });
});
