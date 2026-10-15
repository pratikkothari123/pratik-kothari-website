CREATE SECTOR SCORES
====================

CITATION REQUIRED
If you use these data, you must cite the paper:

Chacon, Ryan, Pratik Kothari, Thibaut G. Morillon, and Cayman Seagraves
(2025). Commercial Real Estate AI Text-Evaluation (CREATE): News-Based
Signals for Predicting REIT Returns. Working paper.
https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5887322
DOI: 10.2139/ssrn.5887322

A BibTeX citation is provided in CREATE_citation.bib.

DATA
File: CREATE_scores_by_sector.csv
Coverage: January 1994 through December 2023 (360 monthly observations).
Release: October 14, 2026.

The Commercial Real Estate AI Text-Evaluation (CREATE) scores aggregate
GPT-5 assessments of Wall Street Journal articles. Identifying details in
the articles are removed before scoring to mitigate look-ahead bias.
This file contains the main-sample, publication-month sector scores.
Consult the paper for the methodology and robustness analyses.

Each sector's score is the equal-weighted monthly mean of available
article-level directional assessments (-1, 0, +1). Higher scores indicate
more positive assessed news implications for that sector's real-estate
values. Neutral zeros enter the mean; failed scoring calls do not.

COLUMNS
score_month: News publication month, in YYYYMM format.
OFFICE: Office.
INDUSTRIAL: Industrial.
RETAIL: Retail.
RESIDENTIAL: Residential.
HEALTHCARE: Healthcare.
LODGING: Lodging.
SELF_STORAGE: Self Storage.
TELECOM: Telecommunications.
DATA_CENTERS: Data Centers.

All nine sector columns contain monthly average scores bounded by -1 and
+1. The first seven sectors cover the full sample. TELECOM starts in
January 2012; DATA_CENTERS starts in December 2015, matching the sector
return availability used by the project. Earlier cells in these two
columns are blank (unavailable), not zero. Do not replace blanks with zero.

TIMING
The file is indexed by news publication month. When matching scores to
next-month returns, use the following calendar month. For example,
score_month=199401 corresponds to February 1994 returns.
The December 1993 signal used to form the paper's January 1994 portfolio
is outside this file. December 2023 scores map to January 2024, beyond
the paper's 1994-2023 return sample. This CSV alone therefore does not
provide every formation signal for the paper's original trading sample.

SOURCE AND CONTACT
Dataset page: https://pratik-kothari.com/data-code.html#create-sector-scores
Contact: pkothari@oakland.edu
