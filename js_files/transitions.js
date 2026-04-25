// Add smooth page transitions
document.addEventListener("DOMContentLoaded", function () {
  // Get all links in the navigation
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Only apply transition for internal links
      const href = this.getAttribute("href");
      if (href && !href.startsWith("http") && !href.startsWith("#")) {
        e.preventDefault(); // Stop immediate navigation

        // Add fade-out effect
        document.body.classList.add("fade-out");

        // Navigate after animation completes
        setTimeout(() => {
          window.location.href = href;
        }, 300); // 300ms = 0.3s fadeOut duration
      }
    });
  });
});
