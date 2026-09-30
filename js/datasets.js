// Add new datasets here with their public name and available download files.
// Register the same dataset ID/name in the Google Sheets endpoint before activation.
window.downloadDatasets = Object.freeze([
  {
    id: 'tax-effectiveness',
    name: 'Tax Effectiveness Scores',
    files: [
      { name: 'Tax Effectiveness Scores (1-year)', path: 'files/tax_effectiveness_1yr.xlsx' },
      { name: 'Tax Effectiveness Scores (5-year)', path: 'files/tax_effectiveness_5yr.xlsx' }
    ]
  }
]);
