document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav')) {
        navLinks.classList.remove('open');
      }
    });
  }

  // Auto-update copyright year
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

// Abstract expand/collapse
function toggleAbstract(btn) {
  var content = btn.closest('.paper-card').querySelector('.abstract-content');
  btn.classList.toggle('open');
  content.classList.toggle('open');
}
