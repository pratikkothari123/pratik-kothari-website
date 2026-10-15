(function () {
  'use strict';

  var form = document.getElementById('download-form');
  var getButtons = Array.from(document.querySelectorAll('.dataset-get'));
  // Use the existing registration form and its events. This module never
  // submits identity details, bypasses registration, or creates download links.
  if (form) {
    getButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (form.getAttribute('aria-busy') === 'true') return;
        var input = Array.from(form.querySelectorAll('input[name="dataset"]')).find(function (option) {
          return option.value === button.dataset.dataset;
        });
        if (!input) return;
        if (!document.getElementById('download-success').hidden) {
          document.getElementById('download-reset').click();
        }
        input.checked = true;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        document.getElementById('download-email').focus({ preventScroll: true });
        document.querySelector('.access-card').scrollIntoView({ block: 'nearest', behavior: 'auto' });
      });
    });
    new MutationObserver(function () {
      var busy = form.getAttribute('aria-busy') === 'true';
      getButtons.forEach(function (button) { button.disabled = busy; });
    }).observe(form, { attributes: true, attributeFilter: ['aria-busy'] });
  }

  var sector = document.getElementById('sector-select');
  var chart = document.querySelector('.sector-chart');
  var svg = document.querySelector('.score-svg');
  if (!sector || !chart || !svg) return;
  document.querySelector('.dataset-explorer').hidden = false;
  var tooltip = chart.querySelector('.score-tooltip');
  var status = chart.querySelector('.score-chart-status');
  var series;
  var rows;
  var selectedIndex = null;
  var plotWidth;
  var guide;
  var dot;
  var margin = { top: 28, right: 12, bottom: 38, left: 43 };
  var height = 235;
  var monthFormat = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

  function add(tag, attributes, text) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attributes || {}).forEach(function (key) { node.setAttribute(key, attributes[key]); });
    if (text !== undefined) node.textContent = text;
    svg.appendChild(node);
    return node;
  }
  function x(index) {
    return margin.left + index * plotWidth / (rows.length - 1);
  }
  function y(value) {
    return margin.top + (1 - value) * (height - margin.top - margin.bottom) / 2;
  }
  function hidePoint() {
    if (guide) guide.setAttribute('visibility', 'hidden');
    if (dot) dot.setAttribute('visibility', 'hidden');
    tooltip.hidden = true;
  }
  function inspect(index) {
    selectedIndex = Math.max(0, Math.min(rows.length - 1, index));
    var point = rows[selectedIndex];
    guide.setAttribute('x1', x(selectedIndex));
    guide.setAttribute('x2', x(selectedIndex));
    guide.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', x(selectedIndex));
    dot.setAttribute('cy', y(point[1] === null ? 0 : point[1]));
    dot.setAttribute('visibility', point[1] === null ? 'hidden' : 'visible');
    tooltip.textContent = monthFormat.format(new Date(point[0] + '-01T00:00:00Z')) + ' · ' +
      (point[1] === null ? 'Not available' : point[1].toFixed(3));
    tooltip.hidden = false;
  }
  function draw() {
    if (!series) return;
    var width = Math.round(chart.getBoundingClientRect().width);
    if (width < 100) return;
    rows = series[sector.value];
    plotWidth = width - margin.left - margin.right;
    svg.replaceChildren();
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('height', height);
    var name = sector.options[sector.selectedIndex].text;
    svg.setAttribute('aria-label', name + ' monthly CREATE scores, 1994–2023');
    add('title', {}, name + ' monthly CREATE scores, 1994–2023');
    add('desc', {}, 'Monthly score between minus one and plus one. Missing observations are gaps.');
    [-1, -0.5, 0, 0.5, 1].forEach(function (value) {
      add('line', { x1: margin.left, x2: width - margin.right, y1: y(value), y2: y(value), class: 'score-grid' });
      add('text', { x: margin.left - 9, y: y(value), dy: '0.32em', 'text-anchor': 'end' }, value.toFixed(1));
    });
    add('line', { x1: margin.left, x2: width - margin.right, y1: height - margin.bottom, y2: height - margin.bottom, class: 'score-axis' });
    (width < 380 ? [1994, 2009, 2023] : [1994, 2004, 2014, 2023]).forEach(function (year) {
      add('text', { x: x((year - 1994) * 12), y: height - margin.bottom + 20, 'text-anchor': 'middle' }, String(year));
    });
    add('text', { x: margin.left, y: 13 }, 'CREATE score');
    var path = '';
    var inSegment = false;
    rows.forEach(function (point, index) {
      if (point[1] === null) {
        inSegment = false;
      } else {
        path += (inSegment ? 'L' : 'M') + x(index).toFixed(2) + ',' + y(point[1]).toFixed(2);
        inSegment = true;
      }
    });
    add('path', { d: path, fill: 'none', stroke: '#356583', 'stroke-width': 1.65 });
    guide = add('line', { y1: margin.top, y2: height - margin.bottom, stroke: '#a7b6c0', visibility: 'hidden' });
    dot = add('circle', { r: 3.5, fill: '#356583', visibility: 'hidden' });
    var hitArea = add('rect', { x: margin.left, y: margin.top, width: plotWidth, height: height - margin.top - margin.bottom, fill: 'transparent' });
    function pointAt(event) {
      var bounds = svg.getBoundingClientRect();
      var pointer = (event.clientX - bounds.left) * width / bounds.width;
      inspect(Math.round((pointer - margin.left) * (rows.length - 1) / plotWidth));
    }
    hitArea.addEventListener('pointermove', pointAt);
    hitArea.addEventListener('click', pointAt);
    hitArea.addEventListener('pointerleave', hidePoint);
    hidePoint();
  }
  sector.addEventListener('change', function () { selectedIndex = null; draw(); });
  svg.addEventListener('keydown', function (event) {
    if (!rows || !['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Escape') return hidePoint();
    var index = selectedIndex === null ? rows.length - 1 : selectedIndex;
    if (event.key === 'ArrowLeft') index -= 1;
    if (event.key === 'ArrowRight') index += 1;
    if (event.key === 'Home') index = 0;
    if (event.key === 'End') index = rows.length - 1;
    inspect(index);
  });
  svg.addEventListener('blur', hidePoint);

  fetch('data/create-sector-scores.json', { credentials: 'omit' })
    .then(function (response) {
      if (!response.ok) throw new Error('Chart data unavailable');
      return response.json();
    })
    .then(function (data) {
      // Every series shares the monthly calendar, so absent values stay gaps.
      var valid = Array.from(sector.options).every(function (option) {
        return Array.isArray(data[option.value]) && data[option.value].length === 360 &&
          data[option.value].every(function (point, index) {
            var expected = (1994 + Math.floor(index / 12)) + '-' + String(index % 12 + 1).padStart(2, '0');
            return Array.isArray(point) && point[0] === expected &&
              (point[1] === null || (Number.isFinite(point[1]) && Math.abs(point[1]) <= 1));
          });
      });
      if (!valid) throw new Error('Invalid chart data');
      series = data;
      status.hidden = true;
      svg.removeAttribute('hidden');
      sector.disabled = false;
      draw();
      if (window.ResizeObserver) new ResizeObserver(draw).observe(chart);
      else window.addEventListener('resize', draw);
    })
    .catch(function () {
      status.textContent = 'Chart unavailable. You can still request the data.';
      svg.setAttribute('hidden', '');
    });
}());
