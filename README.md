# Ascendance

Ascendance is a browser-based cooperative game with a Node.js multiplayer server.

## Run locally

Use Node.js 24 and npm:

```sh
npm ci
npm start
```

Open `http://localhost:3000` (or the port specified by `PORT`). Render uses the same `npm start` command. Persistent room data is configured through `ASCENDANCE_DATA_DIR`; player saves do not belong in the repository.

## Repository layout

| Folder | Contents |
| --- | --- |
| [public/](public/) | The browser game, shared browser/server rule modules, styles, service workers, audio, and artwork. Each browser file has one canonical copy here. |
| [public/assets/](public/assets/) | Hero portraits, showcase artwork, and Enemy illustrations. |
| [public/audio/](public/audio/) | Bundled sound effects and regional ambience. |
| [server/](server/) | Server-only validation and encounter-completion helpers. The root `server.js` remains the deployment entry point. |
| [tests/](tests/) | Rule tests, isolated room/server checks, browser fixtures, and deployment verification. |
| [audit/](audit/) | Audit reports, normalized rule references, coverage contracts, and recorded evidence. |
| [docs/releases/](docs/releases/) | Historical release notes and deployment notes, including the previous long README. Historical test counts describe those releases, not current certification. |
| [docs/reference/](docs/reference/) | The original rules workbook. |
| [.github/workflows/](.github/workflows/) | Automated validation and deployment-source checks. |

Shared rule modules live in `public/` because the browser loads them directly and the Node server imports those same files. Do not add duplicate root copies.

## Checks

```sh
npm test
npx playwright install --with-deps chromium
npm run stability:33621
npm run audit:coverage
```

The browser tests use isolated servers and temporary save directories. Full effect coverage remains a separate requirement: a passing functional suite does not certify every card and status interaction. See [the audit overview](audit/README.md) and [coverage contracts](audit/effect-contracts.json).

The source workbook is [Ascendance v10.52](docs/reference/Ascendance_v10.52_Location_Ongoing_Effect_Clarification.xlsx). Recorded user-approved rule overrides remain in [the normalized reference](audit/workbook-reference-v10.52.json).
