const axios = require('axios');

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

/**
 * Fetch LeetCode stats for a given username
 * @param {string} username - LeetCode username
 * @returns {Promise<object>} { username, totalSolved, realName }
 */
const fetchLeetCodeStats = async (username) => {
  try {
    if (!username || typeof username !== 'string') {
      throw new Error('Invalid username provided');
    }

    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    const response = await axios.post(
      LEETCODE_GRAPHQL_ENDPOINT,
      { query, variables: { username } },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 10000
      }
    );

    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(`LeetCode API error: ${response.data.errors[0].message}`);
    }

    const matchedUser = response.data.data?.matchedUser;
    if (!matchedUser) {
      throw new Error('Username not found on LeetCode');
    }

    // ✅ Correct total solved calculation
    const acSubmissionNum = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
    const totalSolved = acSubmissionNum[0]?.count || 0;

    return {
      username: matchedUser.username,
      totalSolved,
      realName: matchedUser.profile?.realName || username
    };
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error.message);
    throw error;
  }
};

module.exports = {
  fetchLeetCodeStats
};
