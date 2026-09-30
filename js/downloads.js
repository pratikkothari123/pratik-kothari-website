(function () {
  'use strict';

  var form = document.getElementById('download-form');
  if (!form) return;

  var endpoint = (window.downloadRegistration || {}).endpoint || '';
  var local = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) || window.location.protocol === 'file:';
  var preview = local && !endpoint;
  var validEndpoint = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint);
  var submit = form.querySelector('[type="submit"]');
  var status = document.getElementById('form-status');
  var panel = document.getElementById('registration-panel');
  var success = document.getElementById('download-success');
  var email = document.getElementById('download-email');
  var requestId = '';
  var busy = false;
  var datasets = window.downloadDatasets || [];
  var datasetPicker = document.getElementById('dataset-picker');
  var datasetOptions = datasetPicker.querySelector('.dataset-options');
  var datasetLabel = document.getElementById('dataset-current-label');
  datasets.forEach(function (dataset) {
    var existing = Array.from(datasetOptions.querySelectorAll('input')).some(function (input) {
      return input.value === dataset.id;
    });
    if (existing) return;
    var option = document.createElement('label');
    option.className = 'dataset-option';
    var input = document.createElement('input');
    input.type = 'radio';
    input.name = 'dataset';
    input.value = dataset.id;
    input.required = true;
    var name = document.createElement('span');
    name.textContent = dataset.name;
    option.append(input, name);
    datasetOptions.appendChild(option);
  });

  datasetPicker.addEventListener('change', function (event) {
    var input = event.target;
    if (input.name !== 'dataset' || !input.checked) return;
    datasetLabel.textContent = input.closest('label').querySelector('span').textContent;
    datasetPicker.open = false;
    document.getElementById('download-dataset').focus();
  });
  datasetPicker.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      datasetPicker.open = false;
      document.getElementById('download-dataset').focus();
    }
  });
  document.addEventListener('click', function (event) {
    if (!datasetPicker.contains(event.target)) datasetPicker.open = false;
  });
  form.addEventListener('invalid', function (event) {
    var identityValid = ['email', 'name', 'affiliation'].every(function (field) {
      return form.elements.namedItem(field).validity.valid;
    });
    if (event.target.name === 'dataset' && identityValid) datasetPicker.open = true;
  }, true);
  form.addEventListener('reset', function () {
    datasetLabel.textContent = 'Choose a dataset';
    datasetPicker.open = false;
  });

  function showStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state || 'error';
  }

  function showDownloads(dataset) {
    var links = document.getElementById('download-links');
    links.replaceChildren();
    dataset.files.forEach(function (file) {
      var link = document.createElement('a');
      link.className = 'button button-primary';
      link.href = file.path;
      link.download = file.path.split('/').pop();
      link.textContent = file.name + ' (XLSX)';
      links.appendChild(link);
    });
    document.getElementById('success-title').textContent = dataset.name;
    document.getElementById('success-message').textContent = preview
      ? 'Preview complete. No information was sent or saved. These links download the actual dataset files.'
      : 'Thank you for introducing yourself. Your registration has been saved. Download your selected files below.';
    panel.hidden = true;
    success.hidden = false;
    document.getElementById('success-title').focus();
  }

  // Attach the handler before enabling the button. Never fall back to submitting
  // identifying details to the current URL if the service is not configured.
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (busy) return;
    if (!preview && !validEndpoint) {
      showStatus('The download form could not load. Please refresh and try again.');
      return;
    }
    ['email', 'name', 'affiliation'].forEach(function (field) {
      form.elements.namedItem(field).value = form.elements.namedItem(field).value.trim();
    });
    email.setCustomValidity(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '' : 'Please enter a valid email address.');
    if (!form.reportValidity()) return;

    var values = new FormData(form);
    var datasetId = values.get('dataset');
    var dataset = datasets.find(function (item) { return item.id === datasetId; });
    if (!dataset || !dataset.files.length || values.get('website')) {
      showStatus('The form could not be submitted. Please reload and try again.');
      return;
    }
    if (preview) {
      showDownloads(dataset);
      return;
    }

    busy = true;
    var controls = Array.from(form.elements);
    controls.forEach(function (control) { control.disabled = true; });
    form.setAttribute('aria-busy', 'true');
    showStatus('Saving your registration\u2026', 'pending');
    // Keep the ID on retries so an interrupted response does not duplicate rows.
    var body = new URLSearchParams();
    body.set('email', email.value);
    body.set('name', String(values.get('name') || '').trim());
    body.set('affiliation', String(values.get('affiliation') || '').trim());
    body.set('dataset', datasetId);
    // The existing Google endpoint expects this field. No updates are offered.
    body.set('updates', 'no');
    body.set('website', '');

    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 25000);
    try {
      requestId = requestId || window.crypto.randomUUID();
      body.set('request_id', requestId);
      // URLSearchParams makes this a simple form POST, with no CORS preflight.
      // Google redirects ContentService replies; fetch follows that redirect.
      // Never use no-cors: an opaque response cannot confirm a saved registration.
      var response = await fetch(endpoint, {
        method: 'POST',
        body: body,
        credentials: 'omit',
        redirect: 'follow',
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Registration service unavailable');
      var result = await response.json();
      if (result.ok !== true || result.requestId !== requestId) throw new Error('Registration not confirmed');
      showStatus('');
      showDownloads(dataset);
      form.reset();
      requestId = '';
    } catch (error) {
      showStatus('We could not confirm your registration. Please try again, or email pkothari@oakland.edu for help.');
    } finally {
      window.clearTimeout(timeout);
      busy = false;
      controls.forEach(function (control) { control.disabled = false; });
      form.removeAttribute('aria-busy');
    }
  });

  email.addEventListener('input', function () { email.setCustomValidity(''); });
  form.addEventListener('input', function () {
    if (!busy) requestId = '';
  });
  document.getElementById('download-reset').addEventListener('click', function () {
    success.hidden = true;
    panel.hidden = false;
    document.getElementById('download-links').replaceChildren();
    showStatus('');
    email.focus();
  });

  if (!datasets.length) {
    showStatus('Data access is temporarily unavailable. Please refresh the page or email me for access.');
  } else if (preview) {
    document.getElementById('preview-notice').hidden = false;
    submit.disabled = false;
  } else if (validEndpoint) {
    submit.disabled = false;
  } else {
    showStatus('The download form could not load. Please refresh and try again.');
  }
}());
