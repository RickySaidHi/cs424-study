// Deployment configuration. Set demo to true for practice-only exports.
window.STUDY = {
  version: 'study-2',
  demo: false,
  charts: { Static: 'charts/static.html', Interactive: 'charts/interactive.html' },
  questions: {
    '1A': { prompt: 'Compare the table–chair occupancy gap for the **First Floor Circle Lounge** and **Commuter Center** during **midday** **without rain**. Which location has the larger gap?', options: ['First Floor Circle Lounge', 'Commuter Center'] },
    '1B': { prompt: 'Compare the table–chair occupancy gap for the **West Terrace** and **East Terrace** during **midday** **without rain**. Which location has the larger gap?', options: ['West Terrace', 'East Terrace'] },
    '2A': { prompt: 'Compare the increase in typical chair occupancy from **morning to midday** for the **West Terrace** and **Pier Room** **without rain**. Which location has the larger increase?', options: ['West Terrace', 'Pier Room'] },
    '2B': { prompt: 'Compare the increase in typical chair occupancy from **morning to midday** for the **Inner Circle** and **Pier Room** **without rain**. Which location has the larger increase?', options: ['Inner Circle', 'Pier Room'] }
  }
};

// Each part contains a location choice plus a numerical estimate.
// Set an acceptable error tolerance in your private scoring key before testing.
for (const [id, question] of Object.entries(window.STUDY.questions)) {
  question.numeric = {
    prompt: id.startsWith('1')
      ? 'For the location you selected, estimate the **average chair occupancy percentage** during **midday** **without rain**.'
      : 'For the location you selected, estimate the **average chair occupancy percentage** during the **morning** **without rain**.',
    unit: '%',
    min: 0,
    max: 100,
    step: 'any'
  };
}
