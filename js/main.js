document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    function closeNavigation() {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        closeNavigation();
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav')) {
        closeNavigation();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeNavigation();
        toggle.focus();
      }
    });
  }

  document.querySelectorAll('.abstract-toggle').forEach(function (button, index) {
    var content = button.closest('.paper-card').querySelector('.abstract-content');
    content.id = 'abstract-' + index;
    button.setAttribute('aria-controls', content.id);
    button.setAttribute('aria-expanded', String(content.classList.contains('open')));
  });
});

// Abstract expand/collapse
function toggleAbstract(btn) {
  var content = btn.closest('.paper-card').querySelector('.abstract-content');
  btn.classList.toggle('open');
  content.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(content.classList.contains('open')));
}
