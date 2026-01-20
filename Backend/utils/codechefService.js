const puppeteer = require('puppeteer');

/**
 * Fetch CodeChef stats for a given username using Puppeteer (headless browser)
 * This approach handles JavaScript-rendered content better than static HTML parsing
 * 
 * @param {string} username - CodeChef username
 * @returns {Promise<object>} Stats object with problemsSolved, rating, globalRank, stars, etc.
 */
const getCodeChefStats = async (username) => {
  let browser;
  
  try {
    // Input validation
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return {
        error: 'Invalid username provided',
        type: 'INVALID_INPUT'
      };
    }

    const trimmedUsername = username.trim();
    const profileUrl = `https://www.codechef.com/users/${trimmedUsername}`;

    console.log(`🔍 Fetching CodeChef stats for: ${trimmedUsername}`);

    // Launch headless browser with optimized settings
    browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled'
      ],
      timeout: 30000
    });

    // Create new page
    const page = await browser.newPage();

    // Set viewport and user agent to mimic real browser
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to profile page with network idle wait
    console.log(`⏳ Loading profile page...`);
    const response = await page.goto(profileUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Check if page loaded successfully (404 check)
    if (response.status() === 404) {
      console.log(`❌ Profile not found (404)`);
      await browser.close();
      return {
        error: 'Account does not exist',
        type: 'NOT_FOUND'
      };
    }

    // Wait for profile content to load
    // Check if user profile exists by waiting for username header
    console.log(`⏳ Waiting for profile content...`);
    try {
      await page.waitForSelector('.user-details-container', { timeout: 10000 });
    } catch (err) {
      console.log(`❌ Profile container not found`);
      await browser.close();
      return {
        error: 'Account does not exist',
        type: 'NOT_FOUND'
      };
    }

    // Wait extra 1-2 seconds for JavaScript-rendered stats to fully load
    console.log(`⏳ Waiting for stats to render...`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract stats using page.evaluate() - runs in browser context
    console.log(`📊 Extracting stats...`);
    const stats = await page.evaluate(() => {
      const result = {
        username: null,
        totalSolved: 0,
        isPrivate: false,
        debug: [] // For debugging what we found
      };

      // Extract username from profile header
      const usernameElement = document.querySelector('.user-details-container .h2-style');
      if (usernameElement) {
        result.username = usernameElement.textContent.trim();
      }

      // ========================================
      // SIMPLIFIED PROBLEMS SOLVED EXTRACTION
      // Focus on what actually works on CodeChef
      // ========================================
      let problemsCount = 0;
      
      // Primary Method: Look for "Total Problems Solved:" h3 element
      const bodyText = document.body.innerText || document.body.textContent || '';
      const totalSolvedMatch = bodyText.match(/Total\s+Problems\s+Solved:\s*(\d+)/i);
      if (totalSolvedMatch && totalSolvedMatch[1]) {
        problemsCount = parseInt(totalSolvedMatch[1], 10);
        result.debug.push('Found via "Total Problems Solved" pattern: ' + problemsCount);
      }

      // Fallback Method 1: Look for h3 containing "Total Problems Solved"
      if (problemsCount === 0) {
        const h3Elements = document.querySelectorAll('h3');
        for (const h3 of h3Elements) {
          const text = h3.textContent.trim();
          const match = text.match(/Total\s+Problems\s+Solved:\s*(\d+)/i);
          if (match && match[1]) {
            problemsCount = parseInt(match[1], 10);
            result.debug.push('Found via h3 element: ' + problemsCount);
            break;
          }
        }
      }

      // Fallback Method 2: Look in .problems-solved section
      if (problemsCount === 0) {
        const problemsSection = document.querySelector('.problems-solved');
        if (problemsSection) {
          const h3 = problemsSection.querySelector('h3');
          if (h3) {
            const match = h3.textContent.match(/Total\s+Problems\s+Solved:\s*(\d+)/i);
            if (match && match[1]) {
              problemsCount = parseInt(match[1], 10);
              result.debug.push('Found via .problems-solved h3: ' + problemsCount);
            }
          }
        }
      }

      // Fallback Method 3: Look for section with specific text
      if (problemsCount === 0) {
        const sections = document.querySelectorAll('section');
        for (const section of sections) {
          const sectionText = section.textContent;
          const match = sectionText.match(/Total\s+Problems\s+Solved:\s*(\d+)/i);
          if (match && match[1]) {
            problemsCount = parseInt(match[1], 10);
            result.debug.push('Found via section scan: ' + problemsCount);
            break;
          }
        }
      }

      result.totalSolved = problemsCount;

      // Check if profile is private
      if (result.username && result.totalSolved === 0) {
        result.isPrivate = true;
      }

      return result;
    });

    // Close browser
    await browser.close();
    console.log(`✅ Stats extracted successfully`);
    console.log(`🔍 Debug info:`, stats.debug);
    console.log(`📊 Final count: ${stats.totalSolved} problems`);

    // Return error if username not found in profile
    if (!stats.username) {
      return {
        error: 'Account does not exist',
        type: 'NOT_FOUND'
      };
    }

    // Handle private profiles gracefully
    if (stats.isPrivate) {
      console.log(`🔒 Profile is private`);
      return {
        username: trimmedUsername,
        totalSolved: 0,
        isPrivate: true,
        warning: 'CodeChef profile is private. Username saved, but stats cannot be fetched.'
      };
    }

    // Return successful stats
    console.log(`📈 Stats: ${stats.totalSolved} problems`);
    return {
      username: trimmedUsername,
      totalSolved: stats.totalSolved,
      isPrivate: false
    };

  } catch (error) {
    // Ensure browser is closed on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError.message);
      }
    }

    // Handle timeout errors
    if (error.name === 'TimeoutError') {
      console.error('⏱️ Timeout error:', error.message);
      return {
        error: 'Unable to fetch CodeChef data right now. Please try later.',
        type: 'NETWORK_ERROR'
      };
    }

    // Handle navigation errors
    if (error.message && error.message.includes('net::ERR')) {
      console.error('🌐 Network error:', error.message);
      return {
        error: 'Unable to fetch CodeChef data right now. Please try later.',
        type: 'NETWORK_ERROR'
      };
    }

    // Generic error
    console.error('❌ CodeChef Puppeteer Error:', error.message);
    return {
      error: 'Unable to fetch CodeChef data right now. Please try later.',
      type: 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Check if cached data is still valid (less than 1 hour old)
 * @param {Date} lastUpdated - Last update timestamp from database
 * @returns {boolean} True if cache is valid, false otherwise
 */
const isCacheValid = (lastUpdated) => {
  if (!lastUpdated) return false;
  
  const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds
  const now = new Date();
  const timeDiff = now - new Date(lastUpdated);
  
  return timeDiff < ONE_HOUR_MS;
};

/**
 * Main function to fetch CodeChef stats with caching support
 * Used by Express routes to get fresh or cached data
 * 
 * @param {string} username - CodeChef username
 * @param {object} cachedData - Existing data from database (optional)
 * @returns {Promise<object>} Stats object
 */
const fetchCodeChefStats = async (username, cachedData = null) => {
  // Check if we have valid cached data AND username matches
  if (cachedData && cachedData.codechefUpdatedAt && cachedData.codechefUsername) {
    // IMPORTANT: Only use cache if the username matches the requested username
    if (cachedData.codechefUsername.toLowerCase() === username.toLowerCase() && isCacheValid(cachedData.codechefUpdatedAt)) {
      console.log(`Using cached CodeChef data for ${username}`);
      return {
        username: cachedData.codechefUsername,
        totalSolved: cachedData.codechefProblemsSolved || 0,
        rating: cachedData.codechefRating || 0,
        globalRank: cachedData.codechefGlobalRank || null,
        stars: cachedData.codechefStars || null,
        isPrivate: false,
        fromCache: true
      };
    } else if (cachedData.codechefUsername.toLowerCase() !== username.toLowerCase()) {
      console.log(`Username changed from ${cachedData.codechefUsername} to ${username}, fetching fresh data`);
    }
  }

  // Fetch fresh data from CodeChef
  console.log(`Fetching fresh CodeChef data for ${username}`);
  const stats = await getCodeChefStats(username);
  
  // If error occurred, throw it for proper handling
  if (stats.error) {
    const error = new Error(stats.error);
    error.type = stats.type;
    throw error;
  }

  return stats;
};

module.exports = {
  fetchCodeChefStats,
  getCodeChefStats,
  isCacheValid
};
