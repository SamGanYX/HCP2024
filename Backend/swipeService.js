const connection = require('./db'); // Adjust path as needed to your database connection

/**
 * Record a user swipe action
 * @param {number} userId - The ID of the user doing the swiping
 * @param {number} swipedUserId - The ID of the user being swiped on
 * @param {string} swipeType - Either 'left' or 'right'
 * @returns {Promise} - Resolves with the result or rejects with an error
 */
function recordSwipe(userId, swipedUserId, swipeType) {
    return new Promise((resolve, reject) => {
        // Validate inputs
        if (!userId || !swipedUserId || !['left', 'right'].includes(swipeType)) {
            return reject(new Error('Invalid swipe parameters'));
        }

        // Prevent users from swiping on themselves
        if (userId === swipedUserId) {
            return reject(new Error('Users cannot swipe on themselves'));
        }

        const sql = `
            INSERT INTO user_swipes (user_id, swiped_user_id, swipe_type)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE swipe_type = ?
        `;

        connection.query(sql, [userId, swipedUserId, swipeType, swipeType], (err, result) => {
            if (err) {
                console.error(`Error recording ${swipeType} swipe:`, err);
                reject(err);
            } else {
                console.log(`Recorded ${swipeType} swipe from user ${userId} on user ${swipedUserId}`);
                resolve(result);
            }
        });
    });
}

/**
 * Get all users that a specific user has swiped right on
 * @param {number} userId - The ID of the user
 * @returns {Promise} - Resolves with an array of swiped user IDs
 */
function getRightSwipedUsers(userId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT u.* 
            FROM users u
            JOIN user_swipes s ON u.ID = s.swiped_user_id
            WHERE s.user_id = ? AND s.swipe_type = 'right'
        `;

        connection.query(sql, [userId], (err, results) => {
            if (err) {
                console.error('Error fetching right-swiped users:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

/**
 * Check if there's a match between two users (both swiped right on each other)
 * @param {number} userId1 - First user ID
 * @param {number} userId2 - Second user ID
 * @returns {Promise} - Resolves with boolean indicating if there's a match
 */
function checkForMatch(userId1, userId2) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT COUNT(*) as matchCount
            FROM user_swipes s1
            JOIN user_swipes s2 ON s1.user_id = s2.swiped_user_id AND s1.swiped_user_id = s2.user_id
            WHERE s1.user_id = ? AND s1.swiped_user_id = ?
            AND s1.swipe_type = 'right' AND s2.swipe_type = 'right'
        `;

        connection.query(sql, [userId1, userId2], (err, results) => {
            if (err) {
                console.error('Error checking for match:', err);
                reject(err);
            } else {
                const isMatch = results[0].matchCount > 0;
                resolve(isMatch);
            }
        });
    });
}

async function handleSwipe(userId, targetId, direction) {
    return new Promise((resolve, reject) => {
        // First, get the current swipe record for the user
        connection.query(
            'SELECT * FROM user_swipes WHERE user_id = ?',
            [userId],
            (err, results) => {
                if (err) {
                    console.error('Error getting swipe record:', err);
                    return reject(err);
                }

                let swipeRecord = results[0];
                let swipeRight = JSON.parse(swipeRecord.swipe_right || '[]');
                let swipeLeft = JSON.parse(swipeRecord.swipe_left || '[]');
                let matched = JSON.parse(swipeRecord.matched || '[]');

                // Update the appropriate array based on swipe direction
                if (direction === 'right') {
                    if (!swipeRight.includes(targetId)) {
                        swipeRight.push(targetId);
                        console.log(`User ${userId} swiped right on User ${targetId}`);
                    }
                } else if (direction === 'left') {
                    if (!swipeLeft.includes(targetId)) {
                        swipeLeft.push(targetId);
                        console.log(`User ${userId} swiped left on User ${targetId}`);
                    }
                }

                // Update the user's swipe record
                const updateSql = `
                    UPDATE user_swipes 
                    SET swipe_right = ?, swipe_left = ?, matched = ?
                    WHERE user_id = ?
                `;

                connection.query(
                    updateSql,
                    [JSON.stringify(swipeRight), JSON.stringify(swipeLeft), JSON.stringify(matched), userId],
                    (err) => {
                        if (err) {
                            console.error('Error updating swipe record:', err);
                            return reject(err);
                        }

                        // If it's a right swipe, check for a match
                        if (direction === 'right') {
                            checkForMatch(userId, targetId)
                                .then(() => resolve())
                                .catch(reject);
                        } else {
                            resolve();
                        }
                    }
                );
            }
        );
    });
}

async function checkForMatch(userId, targetId) {
    return new Promise((resolve, reject) => {
        // Get the target user's swipe record
        connection.query(
            'SELECT * FROM user_swipes WHERE user_id = ?',
            [targetId],
            (err, results) => {
                if (err) {
                    console.error('Error getting target swipe record:', err);
                    return reject(err);
                }

                const targetRecord = results[0];
                const targetSwipeRight = JSON.parse(targetRecord.swipe_right || '[]');

                // Check if target has swiped right on the user
                if (targetSwipeRight.includes(userId)) {
                    console.log(`Match found between users ${userId} and ${targetId}!`);
                    
                    // Update both users' matched arrays
                    Promise.all([
                        updateMatchedArray(userId, targetId),
                        updateMatchedArray(targetId, userId)
                    ])
                    .then(() => resolve())
                    .catch(reject);
                } else {
                    resolve();
                }
            }
        );
    });
}

async function updateMatchedArray(userId, matchId) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * FROM user_swipes WHERE user_id = ?',
            [userId],
            (err, results) => {
                if (err) {
                    console.error('Error getting user swipe record:', err);
                    return reject(err);
                }

                const record = results[0];
                let matched = JSON.parse(record.matched || '[]');

                if (!matched.includes(matchId)) {
                    matched.push(matchId);
                }

                connection.query(
                    'UPDATE user_swipes SET matched = ? WHERE user_id = ?',
                    [JSON.stringify(matched), userId],
                    (err) => {
                        if (err) {
                            console.error('Error updating matched array:', err);
                            return reject(err);
                        }
                        resolve();
                    }
                );
            }
        );
    });
}

module.exports = {
    recordSwipe,
    getRightSwipedUsers,
    checkForMatch,
    handleSwipe,
    updateMatchedArray
};
