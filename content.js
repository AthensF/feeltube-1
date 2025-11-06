// ==================== CONFIGURATION ====================
// CONFIG is loaded from config.js (see manifest.json)
// To set up: Copy config.example.js to config.js and add your API key

// ==================== CACHE MANAGEMENT ====================
let emotionCache = {};

// Load cache from localStorage
function loadCache() {
  try {
    const cached = localStorage.getItem(CONFIG.CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      // Check if cache is expired
      const now = Date.now();
      if (data.timestamp && (now - data.timestamp) < CONFIG.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
        emotionCache = data.cache || {};
      }
    }
  } catch (e) {
    console.error('[FeelTube] Cache error:', e.message);
  }
}

// Save cache to localStorage
function saveCache() {
  try {
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({
      cache: emotionCache,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('[FeelTube] Cache save error:', e.message);
  }
}

// ==================== LLM API CALL ====================
async function getEmotionTags(videoTitle) {
  // Check cache first
  if (emotionCache[videoTitle]) {
    return emotionCache[videoTitle];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an emotion analyzer. Given a video title, respond with exactly three emotions it might evoke, separated by " | ". Use single words only. Examples: Curiosity | Excitement | Joy'
          },
          {
            role: 'user',
            content: `Given this video title, what are three emotions this video might evoke?\n\nTitle: "${videoTitle}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 30
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const emotions = data.choices[0].message.content.trim();

    // Cache the result
    emotionCache[videoTitle] = emotions;
    saveCache();

    return emotions;

  } catch (error) {
    console.error('[FeelTube] API error:', error.message);
    return 'Curiosity | Interest | Wonder'; // Fallback
  }
}

// ==================== VIDEO TITLE TAGGING ====================
async function tagTitle(titleElement) {
  // Check if already tagged
  if (titleElement.hasAttribute('data-feeltube-tagged')) return;

  // Mark as tagged to prevent double-tagging
  titleElement.setAttribute('data-feeltube-tagged', 'true');

  const originalText = titleElement.textContent.trim();

  // Show loading state
  titleElement.textContent = '[Loading...] ' + originalText;
  titleElement.style.opacity = '0.6';

  try {
    // Get emotion tags from LLM
    const emotions = await getEmotionTags(originalText);

    // Format and apply the tag
    titleElement.textContent = `[${emotions}] ${originalText}`;
    titleElement.style.opacity = '1';
    titleElement.style.fontWeight = 'normal';

  } catch (error) {
    console.error('[FeelTube] Error tagging:', error.message);
    // Revert to original on error
    titleElement.textContent = originalText;
    titleElement.style.opacity = '1';
  }
}

// ==================== FIND AND TAG ALL TITLES ====================
function tagAllTitles() {
  // Detect if we're on mobile or desktop YouTube
  const isMobile = window.location.hostname === 'm.youtube.com';

  // Different selectors for mobile vs desktop YouTube
  const selectors = isMobile ? [
    // Mobile YouTube selectors
    'ytm-rich-item-renderer h3.media-item-headline a',
    'ytm-rich-item-renderer .media-item-headline',
    'ytm-video-with-context-renderer h3 span',
    'ytm-compact-video-renderer h3 span',
    '.compact-media-item-headline'
  ] : [
    // Desktop YouTube selectors (2024+ layout)
    'a.yt-lockup-metadata-view-model__title',
    // Legacy fallback selectors
    'ytd-video-renderer #video-title',
    '#video-title:not([data-feeltube-tagged])'
  ];

  selectors.forEach(selector => {
    const titles = document.querySelectorAll(selector);
    titles.forEach(tagTitle);
  });
}

// ==================== INITIALIZATION ====================
function init() {
  // Load cache first
  loadCache();

  // Check if API key is configured
  if (CONFIG.OPENAI_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('[FeelTube] ⚠️  API key not configured. Copy config.example.js to config.js and add your OpenAI API key.');
    return;
  }

  // Initial tagging with delay to ensure DOM is ready
  setTimeout(() => {
    tagAllTitles();
  }, 1000);

  // Watch for infinite scroll and dynamic content
  const observer = new MutationObserver((mutations) => {
    // Debounce: only run if we see actual changes
    let hasNewContent = false;
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        hasNewContent = true;
      }
    });

    if (hasNewContent) {
      tagAllTitles();
    }
  });

  // Observe the entire page body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
