// This code waits for the transcript menu to be available and clicks it
function openTranscriptPanel() {
    const menuButton = document.querySelector('button[aria-label="More actions"]');
    if (menuButton) {
      menuButton.click();
      setTimeout(() => {
        const items = Array.from(document.querySelectorAll('ytd-menu-service-item-renderer'));
        const transcriptBtn = items.find(item => item.innerText.toLowerCase().includes('transcript'));
        if (transcriptBtn) {
          transcriptBtn.click();
        }
      }, 500);
    }
  }
  
  function extractTranscript() {
    const transcriptLines = Array.from(document.querySelectorAll('ytd-transcript-segment-renderer'));
    if (transcriptLines.length === 0) {
      console.log("Transcript not available or not open.");
      return;
    }
  
    const transcript = transcriptLines.map(el => {
      const time = el.querySelector('.segment-timestamp').innerText;
      const text = el.querySelector('.segment-text').innerText;
      return `${time} - ${text}`;
    });
  
    console.log("YouTube Transcript:\n", transcript.join('\n'));
  }
  
  setTimeout(() => {
    openTranscriptPanel();
    setTimeout(() => extractTranscript(), 2000);
  }, 3000);
  