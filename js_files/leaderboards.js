// leaderboards.js - Updated to filter out guest scores
const tbody = document.getElementById("tbody");
import { leaderboard } from "./module.js";

function newrow(name, score) {
  const row = document.createElement("tr");
  row.innerHTML = `<td>${name}</td><td>${score}</td>`;
  tbody.appendChild(row);
}

// Filter out any guest scores (if they accidentally got saved)
const registeredScores = leaderboard.filter((entry) => {
  // Only include scores from registered users
  return !entry.isGuest && entry.firstname !== "Guest";
});

// Assign a dictionary for highest score for a single player only
const highestScores = {};

registeredScores.forEach((entry) => {
  const name = entry.firstname || entry.username || "Unknown";
  const score = entry.score || 0;

  if (!highestScores[name] || score > highestScores[name]) {
    highestScores[name] = score;
  }
});

// Convert back into an array for sorting
const topPlayers = Object.entries(highestScores).map(([name, score]) => ({
  name,
  score,
}));

// Sort by score (highest first)
topPlayers.sort((a, b) => b.score - a.score);

// Display rows or empty state
if (topPlayers.length === 0) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td colspan="2" style="text-align: center; padding: 2rem; color: #aaa;">
      No scores yet. Be the first to play and set a record!
    </td>
  `;
  tbody.appendChild(row);
} else {
  topPlayers.forEach((player) => newrow(player.name, player.score));
}