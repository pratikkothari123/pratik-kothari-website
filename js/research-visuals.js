// Figures expand in place while the existing paper links and abstracts remain usable.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.research-container .figure-open').forEach(function (button) {
    var row = button.closest('.paper-feature');
    var label = button.getAttribute('aria-label');

    function expand(open, returnFocus) {
      row.classList.toggle('figure-expanded', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? label.replace(/^Enlarge/, 'Collapse') : label);
      if (returnFocus) button.focus();
    }

    button.addEventListener('click', function () {
      expand(!row.classList.contains('figure-expanded'), false);
    });
    row.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && row.classList.contains('figure-expanded')) {
        expand(false, true);
      }
    });
  });
});
