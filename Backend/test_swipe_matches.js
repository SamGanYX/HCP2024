const connection = require('./db');
const swipeService = require('./swipeService');

async function main() {
    const [,, userId, targetId, direction] = process.argv;

    if (!userId || !targetId || !direction) {
        console.log('Usage: node experiment_swipes.js <userId> <targetId> <direction>');
        process.exit(1);
    }

    try {
        await swipeService.handleSwipe(Number(userId), Number(targetId), direction);
        console.log(`User ${userId} swiped ${direction} on User ${targetId}`);

        // Optionally, show the updated user_swipes table for these users
        connection.query(
            'SELECT * FROM user_swipes WHERE user_id IN (?, ?)',
            [userId, targetId],
            (err, results) => {
                if (err) throw err;
                console.log('\nUpdated user_swipes:');
                results.forEach(row => {
                    console.log(`User ${row.user_id}:`);
                    console.log(`  swipe_right: ${row.swipe_right}`);
                    console.log(`  swipe_left: ${row.swipe_left}`);
                    console.log(`  matched: ${row.matched}`);
                });
                connection.end();
            }
        );
    } catch (err) {
        console.error('Error:', err);
        connection.end();
    }
}

main();
