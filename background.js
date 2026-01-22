/**
 * YouTube RSS Link Collector - background.js
 * Handles the browser action (icon click) event.
 */

chrome.action.onClicked.addListener((tab) => {
    console.log('[RSS-Extension] Icon clicked. Tab ID:', tab.id);

    // Check if the current tab is a YouTube page
    if (tab.url && tab.url.includes('youtube.com')) {
        // Send 'copy_rss' command to content.js
        chrome.tabs.sendMessage(tab.id, { action: 'copy_rss' }, (response) => {
            if (chrome.runtime.lastError) {
                console.warn('[RSS-Extension] Failed to send message (content script not loaded):', chrome.runtime.lastError.message);
            } else {
                console.log('[RSS-Extension] Content script response:', response);
            }
        });
    } else {
        console.log('[RSS-Extension] This is not a YouTube page.');
    }
});
