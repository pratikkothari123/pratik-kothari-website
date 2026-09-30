# Download form: setup and activation

The website includes a download-registration form styled to match the rest of
the site. Live registration requires a deployed Google Apps Script endpoint
connected to a private Google Sheet.

## Review now

Run `python -m http.server 4173 --bind 127.0.0.1` from the website folder, then open
http://127.0.0.1:4173/data-code.html. The configured endpoint saves real
registrations from the local website as well as the public site. For a non-saving
layout preview, temporarily empty `endpoint` in `js/download-config.js`; localhost
and file previews then show a notice. Restore the endpoint before publishing.
The download links point to the existing, unmodified XLSX files.

The form requires email, name, institution, and the desired dataset. Each saved
form submission is treated as a download record. There is no update-email
checkbox and this implementation does not send emails.

## Connect a private Google Sheet

1. Create a new **private** Google Sheet. Open **Extensions > Apps Script**, then
   paste `integrations/google-sheets/Code.gs` into its script editor.
2. Run `setupRegistrationSheet` once and authorize access. This creates the
   **Download registrations** tab and saves the spreadsheet ID in script
   properties. Keep the spreadsheet's sharing set to **Restricted**.
3. Use **Deploy > New deployment > Web app**. Execute as **Me**, with access set to
   **Anyone** (visitors should not need a Google account). Copy the `/exec` URL.
   These are Google's [web app deployment settings](https://developers.google.com/apps-script/guides/web).
4. Paste that URL into `endpoint` in `js/download-config.js`. The public script URL
   is not a secret; the spreadsheet ID stays in server-side script properties.
5. Test in the local preview and an incognito browser. Confirm a row appears in
   the private sheet before download links appear. Check the selected dataset's
   files, all three required identity fields, and a retry after a connection
   failure.
   Publish the configured endpoint only after these checks pass.

## Update an existing Google deployment

Website edits do not automatically change the code saved in Google's script
editor. To apply the current server-side validation, replace that editor's
`Code.gs` with `integrations/google-sheets/Code.gs` and save. Select **Deploy >
Manage deployments**, click the pencil, choose **New version** under Version,
and click **Deploy**. The existing `/exec` URL and spreadsheet configuration stay
the same; there is no need to rerun setup.

## What is saved

Timestamp, email, name, institution, requested dataset, and a random request ID.
The existing sheet's legacy **Email updates** column remains for compatibility
and receives **No**. The ID prevents duplicate rows when
a submission is retried after an interrupted response. The endpoint validates
fields and treats spreadsheet formulas as text. GET requests expose no entries.

The browser sends a form-encoded POST and requires a readable, matching success
response before revealing links. Google's [Content Service redirects responses](https://developers.google.com/apps-script/guides/content#redirects),
which the browser follows. If the deployment permissions, redirect, or CORS setup
prevents confirmation, the form reports an error and preserves the fields for a
retry. Do not change this to `no-cors` or treat an opaque response as success.
The real Google deployment must be tested before enabling live registration; local mocks do not
verify a Google account's deployment permissions or browser CORS behavior.

## Limits and maintenance

- Dataset choices use their exact public names. `js/datasets.js` groups files
  belonging to each dataset; Tax Effectiveness Scores currently has 1-year and
  5-year XLSX files. To add new data, add its ID, name, and files to that catalog,
  describe it on `data-code.html`, and add the same ID/name to `allowedDatasets`
  in the Google Sheets script. Redeploy that endpoint when changing its list.
  The picker opens inside the page rather than using a browser popup. Its first
  named choice is present in the HTML so the menu is readable even if scripts
  fail to load; registration still requires JavaScript and confirmed saving.
- The XLSX files remain public on the static website and in its repository. This
  form records visitors who use the download flow; direct or shared file links
  can bypass it. Tracking every download would require private file storage and
  server-side delivery, which is outside this website update.
- On a public hostname with no configured endpoint, registration stays disabled
  and the visitor sees an email contact option. Local preview mode cannot be
  enabled by a URL query parameter.
- Google Apps Script quotas and availability apply. The hidden bot field is only
  basic spam protection. Check the sheet periodically and delete records when
  requested; the website provides your contact address for removal requests.
- The local preview does not load Google Analytics, and form values are not sent
  to analytics or saved in browser storage.
