# Ascendance 3.27.15 — Account Authentication

Adds real server-backed account creation and sign-in to the 3.27.14 video-game front end.

- Create Account / Sign In / Sign Out
- Passwords stored as salted scrypt hashes; plaintext passwords are never persisted
- Random server sessions; browser keeps only the session token for the current tab/session
- Existing New Game / Load Game / Join Game / Create Character and gameplay remain underneath the authenticated menu
- Persistent accounts use `ASCENDANCE_DATA_DIR/accounts` on Render

This is the authentication foundation. Account-owned cloud characters/saves and the Party Lobby are the next data-model step; this build does not silently migrate existing browser-local custom characters into an account.
