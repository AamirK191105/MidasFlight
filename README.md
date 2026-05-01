# Midas Flight: The Escape from Capitalism

A browser-based Flappy Bird-style game built with vanilla HTML, CSS, and JavaScript.

## Gameplay

Guide **Midas** through an endless series of pipes without crashing. The game runs in the browser using an HTML5 Canvas and requires no installation.

| Control | Action |
|---------|--------|
| `Space` | Jump / Restart after game over |
| `↑ Arrow Up` | Jump |

**Scoring:** 1 point is awarded for each pipe pair you pass. Scores are automatically saved to the leaderboard when the game ends (registered users only).

## Features

- **User accounts** — Register and log in to have your scores saved across sessions.
- **Guest play** — Play immediately without an account (scores are not saved).
- **Leaderboard** — Displays the personal best score for every registered player, sorted from highest to lowest.
- **Persistent data** — User accounts and scores are stored in the browser's `localStorage`.

## Project Structure

```
MidasFlight/
├── Assets/
│   ├── midasstack1.png   # Player sprite
│   ├── toppipe.png       # Top pipe image
│   └── bottompipe.png    # Bottom pipe image
├── css/
│   └── styles.css        # Global styles
├── html_files/
│   ├── index.html        # Game page (requires login)
│   ├── login.html        # Login page
│   ├── signup.html       # Registration page
│   └── leaderboards.html # Leaderboard page
└── js_files/
    ├── midasflight.js    # Core game logic (canvas, physics, scoring)
    ├── auth.js           # Signup & login form handling
    ├── leaderboards.js   # Leaderboard display logic
    ├── module.js         # Shared data (users, leaderboard, current user)
    └── transitions.js    # Page transition effects
```

## Getting Started

1. Clone or download the repository.
2. Open `html_files/login.html` in any modern browser — no build step or server required.
3. Register a new account (or use the guest option) and start playing.

## Password Requirements

When registering, passwords must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number.
