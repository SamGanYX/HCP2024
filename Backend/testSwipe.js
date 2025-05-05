const swipeService = require('./swipeService');
const connection = require('./db');

async function testSwipeFunctionality() {
    try {
        // Get some test user IDs
        const users = await new Promise((resolve, reject) => {
            connection.query('SELECT ID FROM users LIMIT 5', (err, results) => {
                if (err) reject(err);
                else resolve(results.map(r => r.ID));
            });
        });

        if (users.length < 2) {
            console.error('Not enough test users found');
            return;
        }

        // User 1 swipes right on User 2
        await swipeService.recordSwipe(users[0], users[1], 'right');
        console.log(`User ${users[0]} swiped right on User ${users[1]}`);

        // User 2 swipes right on User 1 (creating a match)
        await swipeService.recordSwipe(users[1], users[0], 'right');
        console.log(`User ${users[1]} swiped right on User ${users[0]}`);

        // Check for match
        const isMatch = await swipeService.checkForMatch(users[0], users[1]);
        console.log(`Match between users ${users[0]} and ${users[1]}: ${isMatch}`);

        // Get all users that User 1 swiped right on
        const rightSwipedUsers = await swipeService.getRightSwipedUsers(users[0]);
        console.log(`User ${users[0]} swiped right on:`, rightSwipedUsers.map(u => u.Username || u.ID));

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        connection.end();
    }
}
testSwipeFunctionality();