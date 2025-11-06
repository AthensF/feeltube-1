# FeelTube - AI-Powered YouTube Video Emotion Tagger

A browser extension that uses OpenAI's GPT-3.5 to analyze YouTube video titles and tag them with emotions they might evoke. Inspired by [Nudging_YT_Algorithms](https://github.com/ercexpo/Nudging_YT_Algorithms?utm_source=chatgpt.com).

## Features

- 🤖 **AI-Powered**: Uses OpenAI GPT-3.5-turbo to generate emotion tags
- ⚡ **Smart Caching**: Stores results in localStorage to minimize API calls (7-day cache)
- 📱 **Multi-Platform**: Works on both desktop and mobile YouTube
- 🔄 **Real-time**: Tags videos as they appear (infinite scroll support)
- 💰 **Cost-Efficient**: Uses GPT-3.5-turbo (~$0.0005 per video title)
- 🎯 **Context-Aware**: Each video gets unique emotion tags based on its title

## Setup Instructions

### 1. Get an OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

### 2. Configure the Extension

1. **Copy the config template:**
   ```bash
   cp config.example.js config.js
   ```

2. **Edit `config.js` and add your API key:**
   ```javascript
   const CONFIG = {
     OPENAI_API_KEY: 'sk-your-actual-key-here', // Paste your key here
     OPENAI_MODEL: 'gpt-3.5-turbo',
     CACHE_KEY: 'feeltube_emotion_cache',
     CACHE_EXPIRY_DAYS: 7
   };
   ```

   **Note:** `config.js` is gitignored and will never be committed to the repository.

### 3. Load as Unpacked Extension

1. **Open Chrome/Edge Extension Management Page**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `feeltube-1` folder

4. **Verify Installation**
   - You should see "FeelTube - YouTube Video Tagger" in your extensions list

### 4. Test It

1. Navigate to [YouTube](https://www.youtube.com/)
2. Open DevTools Console (F12)
3. Watch for logs like:
   - `[FeelTube] Extension loaded`
   - `[FeelTube] Calling OpenAI for: [video title]`
   - `[FeelTube] Got emotions: Curiosity | Excitement | Joy`
4. Video titles should show emotion tags like: `[Curiosity | Excitement | Joy] Video Title`

## File Structure

```
feeltube-1/
├── manifest.json       # Extension configuration
├── content.js          # Main script that tags video titles
├── config.js           # Your API key (gitignored, not in repo)
├── config.example.js   # Template for config.js
├── styles.css          # Optional styling for tags
├── .gitignore          # Prevents config.js from being committed
└── README.md           # This file
```

## How It Works

1. **Finds video titles** using CSS selectors for YouTube's DOM structure (mobile & desktop)
2. **Shows loading state**: `[Loading...] Video Title`
3. **Checks cache** in localStorage for previously analyzed titles
4. **Calls OpenAI API** with the prompt: "What are three emotions this video might evoke?"
5. **Caches the result** in localStorage (persists across page reloads, 7-day expiry)
6. **Updates the title**: `[Emotion1 | Emotion2 | Emotion3] Video Title`
7. **MutationObserver** watches for new videos from infinite scroll and tags them automatically

## Cost Estimation

- **GPT-3.5-turbo**: ~$0.0005 per video title (~$0.50 per 1000 titles)
- **With caching**: Most titles will be free (reused from cache)
- **Typical usage**: $0.05 - $0.20 per month for casual browsing
- **First-time load**: ~20-30 visible videos = $0.01 - $0.015

## Architecture Details

### Cache System ([content.js:15-44](content.js:15-44))
- Stores emotion tags in `localStorage` with 7-day expiry
- Key format: `feeltube_emotion_cache`
- Reduces API calls by ~90% on repeat visits

### LLM Integration ([content.js:47-98](content.js:47-98))
- Uses OpenAI Chat Completions API
- System prompt ensures consistent format: "Word1 | Word2 | Word3"
- Fallback emotions on error: "Curiosity | Interest | Wonder"
- Max tokens: 30 (keeps costs minimal)

### DOM Manipulation ([content.js:101-131](content.js:101-131))
- Async function handles each title individually
- Shows `[Loading...]` during API call
- Opacity change for visual feedback
- Error handling reverts to original title

## Troubleshooting

### No tags appearing?
- Check console for error messages (F12 → Console)
- Verify `config.js` exists (copied from `config.example.js`)
- Verify API key is correct in `config.js`
- Check if you have OpenAI API credits at [platform.openai.com](https://platform.openai.com/usage)
- Ensure extension is enabled in `chrome://extensions/`

### "[Loading...]" stuck?
- Check Network tab in DevTools for failed requests
- Verify `host_permissions` in [manifest.json:9-11](manifest.json:9-11)
- Check [OpenAI API status](https://status.openai.com/)
- Try refreshing the page

### API rate limits?
- OpenAI has rate limits (free tier: ~3 requests/min)
- The extension respects this but may slow down on first load
- Caching will help on subsequent visits

### Want to clear cache?
Run in DevTools Console on YouTube:
```javascript
localStorage.removeItem('feeltube_emotion_cache');
location.reload();
```

### Incorrect emotion tags?
- The LLM responses can vary - this is expected
- You can adjust the system prompt in [content.js:67-68](content.js:67-68)
- Try using `gpt-4` for more accurate (but expensive) results

## Customization

### Use GPT-4 instead of GPT-3.5
Edit `config.js`:
```javascript
OPENAI_MODEL: 'gpt-4-turbo-preview', // More accurate, ~10x cost
```

### Change number of emotions
Edit the system prompt in [content.js:63](content.js:63):
```javascript
content: 'You are an emotion analyzer. Given a video title, respond with exactly FIVE emotions...'
```

### Adjust cache expiry
Edit `config.js`:
```javascript
CACHE_EXPIRY_DAYS: 30, // Keep cache for 30 days
```

## Future Enhancements

- [ ] Add popup UI for API key configuration (no code editing needed)
- [ ] Support for other LLM providers (Anthropic Claude, local Ollama)
- [ ] Batch API calls for better performance and cost
- [ ] Visual styling for emotion tags (colors based on emotion type)
- [ ] Export/analyze your emotion data over time
- [ ] Filter videos by emotion tags

## License

MIT