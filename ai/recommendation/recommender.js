// Simple collaborative filtering using user-item interactions
// Extend with a real ML model or service for full production use

function recommendForUser(userId, userData, allData) {
  // Example: Recommend users with most common interests
  const interests = userData[userId]?.interests || [];
  const recommendations = Object.entries(userData)
    .filter(([uid]) => uid !== userId)
    .map(([uid, data]) => ({
      user: uid,
      score: data.interests.filter(i => interests.includes(i)).length
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => r.user);
  return recommendations;
}

module.exports = { recommendForUser };