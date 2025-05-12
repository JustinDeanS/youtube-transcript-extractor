let currentTranscriptText = "";
let videoTitle = "youtube_video";

function autoLoadTranscript() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    // Step 1: Open transcript panel
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const menuButton = document.querySelector('button[aria-label="More actions"]');
        if (menuButton) {
          menuButton.click();
          setTimeout(() => {
            const items = Array.from(document.querySelectorAll('ytd-menu-service-item-renderer'));
            const transcriptItem = items.find(item => item.innerText.toLowerCase().includes("transcript"));
            if (transcriptItem) transcriptItem.click();
          }, 500);
        }
      }
    });

    // Step 2: Grab title and extract transcript
    setTimeout(() => {
      // Extract transcript
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const segments = Array.from(document.querySelectorAll('ytd-transcript-segment-renderer'));
          if (!segments.length) {
            return "Transcript not available or still loading.";
          }
          return segments.map(el => {
            const time = el.querySelector('.segment-timestamp')?.innerText || '';
            const text = el.querySelector('.segment-text')?.innerText || '';
            return `${time} - ${text}`;
          }).join('\n');
        }
      }, (results) => {
        currentTranscriptText = results?.[0]?.result || "Failed to extract transcript.";
        document.getElementById("transcript").textContent = currentTranscriptText;

        if (currentTranscriptText && !currentTranscriptText.startsWith("Transcript not available")) {
          document.getElementById("downloadBtn").disabled = false;
        }
      });

      // Extract video title
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => document.title
      }, (results) => {
        const rawTitle = results?.[0]?.result || "youtube_video";
        videoTitle = rawTitle.replace(/[^a-z0-9_\- ]/gi, "").replace(/\s+/g, "_").toLowerCase();
      });

    }, 3000);
  });
}

// Download button logic
document.getElementById("downloadBtn").addEventListener("click", () => {
  const blob = new Blob([currentTranscriptText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${videoTitle}_transcript.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Auto-load transcript on popup open
autoLoadTranscript();
