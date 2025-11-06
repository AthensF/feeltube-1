# FeelTube - YouTube Video Title Tagger

A browser extension that automatically tags video titles on the YouTube home page. Inspired by [Nudging_YT_Algorithms](https://github.com/ercexpo/Nudging_YT_Algorithms?utm_source=chatgpt.com).

## Features

- Automatically prepends `[Hello]` tag to all video titles on YouTube home page
- Handles dynamically loaded content (infinite scroll)
- Prevents duplicate tagging
- Lightweight and performant
- Works on Chrome, Edge, and other Chromium-based browsers

## Installation

### Load as Unpacked Extension (Development Mode)

1. **Clone or download this repository**
   ```bash
   cd /path/to/feeltube-1
   ```

2. **Open Chrome/Edge Extension Management Page**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `feeltube-1` folder (the directory containing `manifest.json`)

5. **Verify Installation**
   - You should see "FeelTube - YouTube Video Tagger" in your extensions list
   - The extension will be enabled automatically

## Usage

1. Navigate to [YouTube](https://www.youtube.com/)
2. Observe that all video titles now start with `[Hello]`
3. Scroll down to load more videos - newly loaded videos will also be tagged
4. Open the browser console (F12) to see extension logs

## File Structure

```
feeltube-1/
├── manifest.json      # Extension configuration
├── content.js         # Main script that tags video titles
├── styles.css         # Optional styling for tags
└── README.md          # This file
```

## How It Works

1. **Content Script Injection**: The extension injects `content.js` into all YouTube pages
2. **Initial Scan**: On page load, the script scans for all video title elements
3. **Tagging**: Each title is prepended with `[Hello]` and marked with a custom attribute
4. **Dynamic Content Handling**: A MutationObserver watches for new videos added via infinite scroll
5. **Duplicate Prevention**: The script tracks tagged videos using the `data-feeltube-tagged` attribute

## Customization

### Change the Tag Text

Edit `content.js:5`:
```javascript
const TAG_TEXT = "Hello";  // Change this to your desired tag
```

### Modify Tag Position

To append instead of prepend, edit `content.js:23`:
```javascript
// Prepend (current):
titleElement.textContent = TAG_PREFIX + originalText;

// Append:
titleElement.textContent = originalText + ` [${TAG_TEXT}]`;
```

### Add Visual Styling

Uncomment and customize styles in `styles.css:13-16`:
```css
#video-title.feeltube-tagged {
  background-color: rgba(255, 235, 59, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
}
```

## Testing Checklist

- [ ] Tags appear on all visible video titles on home page
- [ ] Scrolling down loads new videos that are also tagged
- [ ] Tags don't duplicate when page content refreshes
- [ ] Extension works on different YouTube layouts (grid, list)
- [ ] Console logs show extension activity (F12 → Console)
- [ ] No noticeable performance impact on page load

## Troubleshooting

**Tags not appearing:**
- Check that the extension is enabled in `chrome://extensions/`
- Verify you're on the YouTube home page (`https://www.youtube.com/`)
- Open console (F12) and look for `[FeelTube]` logs

**Tags duplicating:**
- Refresh the YouTube page
- Reload the extension (disable and re-enable)

**Performance issues:**
- Increase the interval in `content.js:101` (currently 2000ms)
- Consider disabling the periodic re-scan if not needed

## Future Enhancements

- [ ] Tag videos based on their properties (views, upload date, channel)
- [ ] Add options page for customizing tags
- [ ] Support for other YouTube pages (search, subscriptions)
- [ ] Sentiment analysis integration
- [ ] User preferences storage

## License

MIT