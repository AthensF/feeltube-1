console.log('[FeelTube] Extension loaded');

// Function to tag a video title
function tagTitle(titleElement) {
  // Check if already tagged
  if (titleElement.hasAttribute('data-feeltube-tagged')) return;

  // Mark as tagged to prevent double-tagging
  titleElement.setAttribute('data-feeltube-tagged', 'true');

  // Prepend [Hello] to the title text
  const originalText = titleElement.textContent.trim();
  titleElement.textContent = '[Hello] ' + originalText;

  console.log('[FeelTube] Tagged:', originalText);
}

// Tag all visible titles
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
    // console.log(`[FeelTube] Found ${titles.length} titles with selector: ${selector}`);
    titles.forEach(tagTitle);
  });
}

// Wait for YouTube to load, then tag titles
function init() {
  console.log('[FeelTube] Initializing on:', window.location.pathname);

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