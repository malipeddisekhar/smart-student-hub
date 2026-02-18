const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetch CodeChef stats for a given username using axios + cheerio (lightweight HTTP)
 * Much faster than Puppeteer — no browser launch needed (~1-3s vs 30s+)
 * 
 * @param {string} username - CodeChef username
 * @returns {Promise<object>} Stats object with totalSolved, rating, stars, etc.
 */
const getCodeChefStats = async (username) => {
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

    // Fetch profile page via HTTP (no browser needed — ~1-3s)
    const { data: html } = await axios.get(profileUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    const $ = cheerio.load(html);

    // Check if user exists
    if (html.includes('not exist') && !$('.user-details-container').length) {
      console.log(`❌ Profile not found`);
      return {
        error: 'Account does not exist',
        type: 'NOT_FOUND'
      };
    }

    // Extract username from profile header
    const usernameEl = $('.user-details-container .h2-style');
    const profileUsername = usernameEl.length ? usernameEl.text().trim() : null;

    if (!profileUsername) {
      return {
        error: 'Account does not exist',
        type: 'NOT_FOUND'
      };
    }

    // Extract "Total Problems Solved: N" from the problems-solved section
    let totalSolved = 0;
    const totalSolvedMatch = html.match(/Total\s+Problems\s+Solved:\s*(\d+)/i);
    if (totalSolvedMatch && totalSolvedMatch[1]) {
      totalSolved = parseInt(totalSolvedMatch[1], 10);
      console.log(`📊 Found via regex: ${totalSolved} problems`);
    }
    
    // Fallback: scan h3 elements in .problems-solved section
    if (totalSolved === 0) {
      $('.problems-solved h3').each((_, el) => {
        const text = $(el).text().trim();
        const match = text.match(/Total\s+Problems\s+Solved:\s*(\d+)/i);
        if (match && match[1]) {
          totalSolved = parseInt(match[1], 10);
          console.log(`📊 Found via cheerio h3: ${totalSolved} problems`);
        }
      });
    }

    // Extract rating
    let rating = 0;
    const ratingEl = $('.rating-header .rating-number');
    if (ratingEl.length) {
      rating = parseInt(ratingEl.first().text().trim(), 10) || 0;
    }

    // Extract stars (count ★ symbols in .rating-star)
    let stars = 0;
    const starEl = $('.rating-star span');
    if (starEl.length) {
      stars = starEl.length;
    }

    // Extract global rank
    let globalRank = null;
    const rankEl = $('.global-rank');
    if (rankEl.length) {
      globalRank = parseInt(rankEl.first().text().trim(), 10) || null;
    }

    console.log(`✅ Stats: ${totalSolved} problems, rating ${rating}, ${stars} stars`);

    // Handle profiles with zero solved problems (possibly private)
    if (totalSolved === 0) {
      return {
        username: trimmedUsername,
        totalSolved: 0,
        rating,
        stars,
        globalRank,
        isPrivate: true,
        warning: 'CodeChef profile is private or has zero problems solved.'
      };
    }

    return {
      username: trimmedUsername,
      totalSolved,
      rating,
      stars,
      globalRank,
      isPrivate: false
    };

  } catch (error) {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      console.error('⏱️ Timeout error:', error.message);
      return {
        error: 'Unable to fetch CodeChef data right now. Please try later.',
        type: 'NETWORK_ERROR'
      };
    }

    // Handle network / HTTP errors
    if (error.response) {
      if (error.response.status === 404) {
        return { error: 'Account does not exist', type: 'NOT_FOUND' };
      }
      console.error(`🌐 HTTP ${error.response.status}:`, error.message);
      return {
        error: 'Unable to fetch CodeChef data right now. Please try later.',
        type: 'NETWORK_ERROR'
      };
    }

    console.error('❌ CodeChef fetch error:', error.message);
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
