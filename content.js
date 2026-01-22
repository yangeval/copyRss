/**
 * YouTube RSS Link Collector - content.js (Robust version)
 * Copies the RSS URL to clipboard when the icon is clicked.
 */

(function () {
    'use strict';

    const LOG_PREFIX = '[RSS-Extension]';

    console.log(`${LOG_PREFIX} Extension activated.`);

    /**
     * Extracts JSON data assigned to a specific variable within script tags on the page.
     */
    function getScriptData(varName) {
        try {
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const text = script.textContent;
                if (text.includes(`${varName} =`)) {
                    // Extract only the JSON object part (from start of brace to end)
                    const regex = new RegExp(`${varName}\\s*=\\s*({.+?});`);
                    const match = text.match(regex);
                    if (match && match[1]) {
                        return JSON.parse(match[1]);
                    }
                }
            }
        } catch (err) {
            console.error(`${LOG_PREFIX} ${varName} parsing failed:`, err);
        }
        return null;
    }

    /**
     * Extraction logic specifically for video playback pages (/watch)
     */
    function getRssUrlFromVideo() {
        console.log(`${LOG_PREFIX} Analyzing video page...`);

        // [Priority 1] Extract directly from DOM (Real-time info even during SPA navigation)
        // Search for UC... ID within the HTML of #owner or ytd-video-owner-renderer elements.
        const ownerSelectors = ['#owner', 'ytd-video-owner-renderer', '#upload-info', '#channel-name', '#subscribe-button'];
        for (const selector of ownerSelectors) {
            const el = document.querySelector(selector);
            if (el) {
                const match = el.outerHTML.match(/UC[a-zA-Z0-9_-]{22}/);
                if (match) {
                    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${match[0]}`;
                    console.log(`${LOG_PREFIX} Real-time extraction from DOM(${selector}):`, url);
                    return url;
                }
            }
        }

        // [Priority 2] Official player response data (Fallback for initial load)
        const playerResponse = getScriptData('ytInitialPlayerResponse');
        const channelId = playerResponse?.videoDetails?.channelId;
        if (channelId && channelId.startsWith('UC')) {
            const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
            console.log(`${LOG_PREFIX} Found in ytInitialPlayerResponse:`, url);
            return url;
        }

        // [Priority 3] Info card video button link
        const infoCardLink = document.querySelector('#infocard-videos-button a');
        const infoMatch = infoCardLink?.href?.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
        if (infoMatch) {
            const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${infoMatch[1]}`;
            console.log(`${LOG_PREFIX} Extracted from info card button:`, url);
            return url;
        }

        // [Priority 4] Channel link element within player (e.g., end cards)
        const playerChannelLink = document.querySelector('a.ytp-ce-channel-title.ytp-ce-link');
        const playerMatch = playerChannelLink?.href?.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
        if (playerMatch) {
            const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${playerMatch[1]}`;
            console.log(`${LOG_PREFIX} Extracted from player channel link:`, url);
            return url;
        }

        return null;
    }

    /**
     * Extraction logic specifically for channel home pages
     */
    function getRssUrlFromHead() {
        console.log(`${LOG_PREFIX} Analyzing channel home...`);

        // [Priority 1] YouTube's official RSS alternate link tag
        const rssLink = document.querySelector('link[rel="alternate"][type="application/rss+xml"]');
        if (rssLink && rssLink.href.includes('channel_id=UC')) {
            console.log(`${LOG_PREFIX} Found in RSS Alternate tag:`, rssLink.href);
            return rssLink.href;
        }

        // [Priority 2] Meta tag (itemprop="channelId" - present even on handle pages)
        const channelIdMeta = document.querySelector('meta[itemprop="channelId"]');
        if (channelIdMeta && (channelIdMeta.content || channelIdMeta.getAttribute('content'))) {
            const cid = channelIdMeta.content || channelIdMeta.getAttribute('content');
            const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${cid}`;
            console.log(`${LOG_PREFIX} Extracted from meta tag(channelId):`, url);
            return url;
        }

        // [Priority 3] Extract UC ID from Canonical URL
        const canonical = document.querySelector('link[rel="canonical"]')?.href;
        let match = canonical?.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
        if (match) {
            const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${match[1]}`;
            console.log(`${LOG_PREFIX} Extracted from Canonical link:`, url);
            return url;
        }

        // [Priority 4] Extract UC ID from Open Graph URL
        const ogUrl = document.querySelector('meta[property="og:url"]')?.content;
        match = ogUrl?.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
        if (match) {
            const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${match[1]}`;
            console.log(`${LOG_PREFIX} Extracted from og:url tag:`, url);
            return url;
        }

        // [Priority 5] Extract from ytInitialData
        const data = getScriptData('ytInitialData');
        const cidData = data?.metadata?.channelMetadataRenderer?.externalId;
        if (cidData && cidData.startsWith('UC')) {
            const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${cidData}`;
            console.log(`${LOG_PREFIX} Extracted from ytInitialData:`, url);
            return url;
        }

        // [Priority 6] DOM text search (Last resort)
        const bodyMatch = document.body.innerHTML.match(/UC[a-zA-Z0-9_-]{22}/);
        if (bodyMatch) {
            const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${bodyMatch[0]}`;
            console.log(`${LOG_PREFIX} Extracted from DOM text search:`, url);
            return url;
        }

        return null;
    }

    /**
     * Displays a toast message
     */
    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            background-color: ${isError ? '#f44336' : '#323232'};
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            z-index: 10000;
            font-family: Roboto, Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: opacity 0.3s;
            pointer-events: none;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Copy process execution
     */
    async function executeCopy() {
        // Initialize targetRssUrl to null before starting
        let targetRssUrl = null;
        const path = location.pathname;

        if (path.includes('/watch')) {
            // [Video playback page] extraction
            targetRssUrl = getRssUrlFromVideo();
        } else {
            // [Channel home, etc.] extraction
            targetRssUrl = getRssUrlFromHead();
        }

        // If null, show error message
        if (!targetRssUrl) {
            console.warn(`${LOG_PREFIX} Unable to generate RSS URL (information not found)`);
            showToast('Could not find channel information. Please check if you are on a channel page.', true);
            return;
        }

        try {
            // [Important] Focus must be moved back to the document for copy to be allowed
            // since focus shifts to the browser toolbar when the icon is clicked.
            window.focus();

            await navigator.clipboard.writeText(targetRssUrl);
            console.log(`${LOG_PREFIX} Copy success:`, targetRssUrl);
            showToast('RSS address copied to clipboard!');
        } catch (err) {
            console.error(`${LOG_PREFIX} Copy failed:`, err);
            showToast('Failed to copy to clipboard.', true);
        }
    }

    /**
     * Message listener from background script
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log(`${LOG_PREFIX} Message received:`, request.action);
        if (request.action === 'copy_rss') {
            executeCopy();
            sendResponse({ status: 'success' });
        }
    });

})();
