# YouTube RSS Extractor
Easily copy YouTube channel RSS URLs to your clipboard.

## Installation
1. Clone this repository.
2. Go to your browser's extension management page and 'Load unpacked extension'.

## How it Works
This extension **does not use the Google API.**
- It directly extracts the Channel ID from the metadata and DOM structure of the currently open YouTube page to generate the RSS URL.
- No separate API calls or authentication (API Key) are required, making it lightweight and privacy-friendly.

## Usage
1. Navigate to YouTube.
2. You can extract RSS URLs from the following two types of pages:
   - **Channel Main Page**: A YouTuber's home screen (e.g., `https://www.youtube.com/@channelname`)
   - **Video Playback Page**: The page where you are watching a video (e.g., `https://www.youtube.com/watch?v=videoID`)
3. Click the extension icon.
4. Check the result:
    - **Success**: A message `"RSS address copied to clipboard!"` will appear. You can then paste (Ctrl+V) it wherever you need.
    - **Failure**: A message `"Could not find channel information. Please check if you are on a channel page."` will appear. Ensure you are on a valid YouTube channel or video page.
