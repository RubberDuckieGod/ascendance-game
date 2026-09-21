# Ascendance 2.8.0 — Remote Multiplayer

## Run locally
1. Install Node.js 20+.
2. Open a terminal in this folder.
3. Run: `npm install`
4. Run: `npm start`
5. Open `http://localhost:3000` in your browser.

## Test remote-style networking on one computer
Open two browser windows at `http://localhost:3000`.
Choose **Remote** mode in both, use the same room code, assign Aldric to one and Lyra to the other, then Connect.

## Put it on the internet
Deploy this whole folder to any Node.js host that supports WebSockets. The host must run `npm install` and `npm start`, and expose its assigned PORT. Share the resulting HTTPS address with your friend. Both players use Remote mode and the same room code.

## Current 2.8.0 limitation
This build synchronizes the complete game snapshot to all clients. That is fine for functional playtesting, but a technically curious player could inspect another Hero's hand in browser state. Private hand/deck filtering should be added before treating hidden information as secure.

## Architecture
Browser -> WebSocket `/ws` -> room relay/server -> other browsers.
The server retains the latest room state so a joining/reconnecting client can receive the current game.
