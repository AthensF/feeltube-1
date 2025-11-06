console.log('[FeelTube] Extension loaded');

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
        console.log('[FeelTube] Loaded cache with', Object.keys(emotionCache).length, 'entries');
      } else {
        console.log('[FeelTube] Cache expired, starting fresh');
      }
    }
  } catch (e) {
    console.error('[FeelTube] Error loading cache:', e);
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
    console.error('[FeelTube] Error saving cache:', e);
  }
}

// ==================== LLM API CALL ====================
async function getEmotionTags(videoTitle) {
  // Check cache first
  if (emotionCache[videoTitle]) {
    console.log('[FeelTube] Cache hit for:', videoTitle);
    return emotionCache[videoTitle];
  }

  console.log('[FeelTube] Calling OpenAI for:', videoTitle);

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

    console.log('[FeelTube] Got emotions:', emotions);
    return emotions;

  } catch (error) {
    console.error('[FeelTube] Error calling OpenAI:', error);
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

    console.log('[FeelTube] Tagged:', originalText, '→', emotions);

  } catch (error) {
    console.error('[FeelTube] Error tagging title:', error);
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
    // Desktop YouTube selectors
    'ytd-rich-item-renderer h3 a#video-title',
    'ytd-rich-item-renderer #video-title',
    'ytd-video-renderer h3 a#video-title',
    'ytd-grid-video-renderer h3 a#video-title'
  ];

  console.log(`[FeelTube] Running on ${isMobile ? 'MOBILE' : 'DESKTOP'} YouTube`);

  selectors.forEach(selector => {
    const titles = document.querySelectorAll(selector);
    titles.forEach(tagTitle); // tagTitle is now async, but forEach doesn't wait
  });
}

// ==================== INITIALIZATION ====================
function init() {
  console.log('[FeelTube] Initializing on:', window.location.pathname);

  // Load cache first
  loadCache();

  // Check if API key is configured
  if (CONFIG.OPENAI_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('[FeelTube] ⚠️  Please configure your OpenAI API key in content.js');
    console.error('[FeelTube] Edit the OPENAI_API_KEY in the CONFIG object');
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

  console.log('[FeelTube] Observer started');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
