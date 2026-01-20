/**
 * Test script for CodeChef Puppeteer service
 * Run this to test the CodeChef stats fetching before integrating with the app
 * 
 * Usage: node test-codechef.js <username>
 * Example: node test-codechef.js gennady.korotkevich
 */

const { getCodeChefStats } = require('./utils/codechefService');

// Get username from command line arguments
const username = process.argv[2];

if (!username) {
  console.error('❌ Error: Please provide a CodeChef username');
  console.log('Usage: node test-codechef.js <username>');
  console.log('Example: node test-codechef.js gennady.korotkevich');
  process.exit(1);
}

console.log(`\n🔍 Fetching CodeChef stats for: ${username}\n`);
console.log('⏳ Please wait... (This may take 10-30 seconds)\n');

const startTime = Date.now();

getCodeChefStats(username)
  .then(result => {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('✅ Success!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CodeChef Stats:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
      console.log(`🔖 Type: ${result.type}`);
    } else {
      console.log(`👤 Username: ${result.username}`);
      console.log(`✅ Problems Solved: ${result.totalSolved}`);
      console.log(`⭐ Rating: ${result.rating || 'N/A'}`);
      console.log(`🌍 Global Rank: ${result.globalRank ? '#' + result.globalRank : 'N/A'}`);
      console.log(`🏆 Stars: ${result.stars || 'N/A'}`);
      console.log(`🔒 Private Profile: ${result.isPrivate ? 'Yes' : 'No'}`);
      
      if (result.warning) {
        console.log(`⚠️  Warning: ${result.warning}`);
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏱️  Fetch Duration: ${duration}s\n`);
  })
  .catch(error => {
    console.error('\n❌ Unexpected Error:');
    console.error(error);
    process.exit(1);
  });
