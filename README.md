# UIC study-space evaluation

Simple HTML/JavaScript website for GitHub Pages. No build, account, server database, or installation needed for hosting. This package is configured for deployment with demo mode off and version study-1. It includes your supplied scatterplots and all four Task 2 question variants. No build step is needed.

## Run locally

From this folder, run `python -m http.server 8000`, then open `http://localhost:8000`. Do not open index.html directly: chart loading uses HTTP. Use the same browser and laptop for participants.

## Add your study

1. Your supplied scatter_static.html and scatter_interactive.html are included as charts/static.html and charts/interactive.html. Keep static and interactive positions, data, dimensions and encodings identical. Disable tooltips and export menus as planned. Every interactive chart must start with all filters checked. Each trial reloads its iframe to reset it.
2. Both included chart files already send the readiness message. If replacing them, send this message **after Vega finishes rendering**. For an Altair export, add it inside the existing `vegaEmbed(...).then(function(result) { ... })` success callback, rather than calling vegaEmbed twice:

```javascript
result.view.runAsync().then(function () {
  window.parent.postMessage({ type: 'study-chart-ready' }, window.location.origin);
});
```

The iframe loads hidden. The start button unlocks only after this message. Clicking Start reveals the chart and question together and begins timing. A static PNG wrapper can send the message from the image's load handler instead. The included charts report their height so the iframe expands to show the checkboxes. Chart libraries load from a CDN, so an internet connection is required.

3. The four prompts and location options in config.js match your Task 2 draft. Pilot their comparability in BOTH chart versions and finalize the scoring rules. Keep your answer key separately from the public participant website.
4. Demo mode is already off. Update `version` when the protocol changes. Saved sessions with another version or mode cannot silently continue. Finish/export any demo session before real collection.

## Procedure

Enter assigned participant numbers consecutively. Four sequences repeat by participant number: 1 = Static A then Interactive B; 2 = Interactive A then Static B; 3 = Static B then Interactive A; 4 = Interactive B then Static A. Each block uses Task 1 then Task 2. Both conditions receive short unscored practice first, in their assigned order. Extend practice with finalized examples if needed.

Each of the four scored parts has a location choice and a numeric estimate submitted together, then two required ratings (1 easy to 5 difficult). Answers lock on submission; no answer feedback is shown. Timing excludes loading and ratings, includes reading and elapsed time while the tab is hidden. Reloading during an unanswered part starts that part again with a new timer. Refreshes and tab switches are not counted.

## Results

One row per part (four rows per participant), with two answers and one combined completion time. There are eight answer fields total. Document these as four analytical questions with two response components. Data persists in localStorage in this browser; this is not a central database or a backup. Export after each participant and confirm the file before reset. Download remains available if the button is clicked more than once. Do not publish participant CSVs to the public repository.

CSV fields include study version, demo flag, participant and sequence IDs, part, condition, task, variant, question wording, location response, numeric prompt, numeric response and unit, completion seconds for the pair, difficulty ratings. No date/time stamps, restart counts, or tab-switch counts are collected. Missing ratings are blank if an incomplete session is recovered/exported. Files have a unique run identifier so repeat runs do not silently overwrite one another.

Accuracy is intentionally scored OFFLINE: join the exported responses to your private answer key using `study_version` and `question_id`, then add expected_answer and correct (1/0). No answers are invented or exposed during the study. This is a deliberate difference from including correctness directly in the browser CSV.

## GitHub Pages

1. Extract the ZIP on your computer.
2. Create a public GitHub repository, such as cs424-study.
3. Select Add file → Upload files. Upload the extracted contents, including the charts folder. Do not upload the ZIP itself. index.html must be at the repository root.
4. Commit the uploaded files to main.
5. Open Settings → Pages. Under Source, select Deploy from a branch. Select main and /(root), then Save.
6. Wait for the Pages deployment to finish. The Pages settings show your website link, usually https://YOUR-USERNAME.github.io/cs424-study/.
7. Open the published link and complete a test run, including downloading the CSV. Discard that test file before collecting participant results.

For an existing coursework repository, put these files inside docs/ instead and select /docs as the Pages folder. Keep charts/ beside index.html. Avoid replacing an existing Pages site unintentionally.

GitHub Pages hosts static files; it cannot append results to a shared CSV. Download and collect one CSV per participant. Chart libraries require an internet connection.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Before real testing

- Confirm all four sequences, each version's practice, and four submissions per participant.
- Check timer starts at question reveal, not chart loading; cannot submit twice or skip ratings.
- Check the charts' readiness messages and filter reset work with your real exported charts.
- Verify a refresh during an answer restarts the part with a new timer; a refresh during ratings preserves the submitted answer.
- Inspect the exported CSV for responses, ratings, IDs and elapsed seconds; check the private answer key.
- Verify question variants have comparable difficulty and static marks remain readable without filtering.

Current validation: JavaScript syntax and sequence balance checked. The supplied charts are integrated; their datasets (169 observations), jittered coordinates, marks, and encodings match. A full browser pilot remains necessary.

## Numeric estimates

The numerical question asks for average chair occupancy for the selected location without rain: midday in Task 1 and morning in Task 2. Inputs accept 0–100%, including decimals. One completion time covers both responses, followed by two difficulty ratings.

Keep the expected answers outside the public website. Finalize the numerical scoring tolerance, the meaning of typical occupancy and occupancy gap, and how to score numerical responses when the selected location is incorrect. The site records raw answers for offline scoring; it does not assume these decisions. Demo mode is disabled in this deployment package.
