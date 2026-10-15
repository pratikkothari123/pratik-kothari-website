// Figures expand in place while the existing paper links and abstracts remain usable.
document.addEventListener('DOMContentLoaded', function () {
  var root = document.querySelector('.research-container');
  if (!root) return;

  root.querySelectorAll('.figure-open').forEach(function (button) {
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

  var sections = Array.from(root.querySelectorAll('.section-nav a[href^="#"]')).map(function (link) {
    return { link: link, section: document.getElementById(link.getAttribute('href').slice(1)) };
  }).filter(function (item) {
    return item.section && root.contains(item.section);
  });
  if (!sections.length) return;

  var currentLink = null;
  var framePending = false;
  function updateCurrentSection() {
    framePending = false;
    var active = sections[0];
    var readingLine = Math.min(160, window.innerHeight * 0.2);
    sections.forEach(function (item) {
      if (item.section.getBoundingClientRect().top <= readingLine) active = item;
    });
    // The final section can be shorter than the viewport and never reach the reading line.
    var page = document.scrollingElement || document.documentElement;
    if (page.scrollTop > 0 && page.scrollTop + window.innerHeight >= page.scrollHeight - 2) {
      active = sections[sections.length - 1];
    }
    if (active.link === currentLink) return;
    currentLink = active.link;
    sections.forEach(function (item) {
      if (item.link === currentLink) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    });
  }
  function scheduleSectionUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateCurrentSection);
  }

  window.addEventListener('scroll', scheduleSectionUpdate, { passive: true });
  ['resize', 'hashchange', 'pageshow', 'load'].forEach(function (event) {
    window.addEventListener(event, scheduleSectionUpdate);
  });
  // Abstracts, enlarged figures, and late-loading fonts/images can move the section boundary.
  if (window.ResizeObserver) {
    var observer = new ResizeObserver(scheduleSectionUpdate);
    sections.forEach(function (item) { observer.observe(item.section); });
  } else {
    root.addEventListener('click', scheduleSectionUpdate);
    root.addEventListener('load', scheduleSectionUpdate, true);
  }
  scheduleSectionUpdate();
});
