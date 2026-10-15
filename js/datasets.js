// Add new datasets here with their public name and available download files.
// Register the same dataset ID/name in the Google Sheets endpoint before activation.
window.downloadDatasets = Object.freeze([
  {
    id: 'create-sector-scores',
    name: 'CREATE Sector Scores',
    citation: {
      text: 'Chacon, Ryan, Pratik Kothari, Thibaut G. Morillon, and Cayman Seagraves (2025). Commercial Real Estate AI Text-Evaluation (CREATE): News-Based Signals for Predicting REIT Returns.',
      url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5887322'
    },
    files: [
      { name: 'CREATE Sector Scores', path: 'files/CREATE_scores_by_sector.csv' },
      { name: 'Data guide and required citation', path: 'files/CREATE_README.txt' },
      { name: 'BibTeX citation', path: 'files/CREATE_citation.bib' }
    ]
  },
  {
    id: 'tax-effectiveness',
    name: 'Tax Effectiveness Scores',
    files: [
      { name: 'Tax Effectiveness Scores (1-year)', path: 'files/tax_effectiveness_1yr.xlsx' },
      { name: 'Tax Effectiveness Scores (5-year)', path: 'files/tax_effectiveness_5yr.xlsx' }
    ]
  }
]);
