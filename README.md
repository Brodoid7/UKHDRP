# All-in-One Discord Bot

Anti-nuke • Anti-raid/auto-mod • Anti-ping • Utilities & moderation • Music • Auto-responses • AFK • Applications (unlimited questions) • Modmail • **Global bans • Flags • Bot staff & whitelists • Blacklists**

## Setup
1. Create a bot at https://discord.com/developers/applications → Bot tab → enable **all three Privileged Intents** (Presence not needed; Server Members + Message Content are).
2. Invite it with the `bot` + `applications.commands` scopes and **Administrator** (or at least: Manage Server/Roles/Channels/Webhooks, Kick/Ban, Moderate Members, View Audit Log, Manage Messages, Connect/Speak).
3. `cp .env.example .env` and fill in `TOKEN`, `CLIENT_ID`, `GUILD_ID` and **`OWNER_IDS`** (your Discord user ID; comma-separate several).
4. `npm install` then `npm start` (Node 18.17+; Node 20+ recommended).
5. **Drag the bot's role to the very top** of your role list, otherwise anti-nuke can't punish people.

## First-time config
| Feature | Commands |
|---|---|
| Logs | `/setlogs #channel` |
| Anti-nuke (owner only) | `/antinuke toggle true`, `/antinuke whitelist add @trusted`, `/antinuke limit`, `/antinuke punishment` |
| Anti-raid | `/antiraid toggle true`, `joins`, `accountage`, `spam`, `mentions`, `invites`, `action`, `lockdown` |
| Anti-ping | `/antiping user @boss true`, `/antiping role @Staff true`, `/antiping bypass` |
| Auto-response | `/autoresponse add trigger:hello response:Hey {user}!` |
| Applications | `/appadmin create staff` → `addquestion` (as many as you like) → `review #channel` → `role @Staff`; members run `/apply staff` |
| Modmail | `/modmail setup category:#Modmail staffrole:@Staff logs:#mail-logs`; users just DM the bot; staff reply in the thread channel (`//` = private note); `/modmail close` |
| Music | `/play`, `/skip`, `/pause`, `/stop`, `/queue`, `/loop`, `/shuffle`, `/volume`, `/nowplaying` |
| Other | `/afk`, `/help`, `/userinfo`, `/serverinfo`, `/avatar`, `/poll`, `/purge`, `/lock`, `/unlock`, `/slowmode`, `/kick`, `/ban`, `/unban`, `/timeout`, `/warn`, `/warnings`, `/say` |

## Staff, whitelist, global ban, flags, blacklist
**Bot staff ranks** (global, shared across every server the bot is in)
| Rank | Who | Can do |
|---|---|---|
| owner | `OWNER_IDS` + the app owner | everything, incl. adding admins/mods (`/staff add`) and the global whitelist (`/staff whitelist`) |
| admin | added by an owner | `/gban add/remove/sync`, `/blacklist bot …`, add/remove mods |
| mod | added by an owner/admin | global flags (`/flag add scope:global`), view `/gban list`, `/staff list` |

**Whitelists** bypass anti-nuke, anti-raid, anti-ping and word filters, and are immune to flag auto-actions / blacklist auto-removal:
- *Global whitelist*: `/staff whitelist @user true` (owners only), applies in every server and also makes the user un-gbannable.
- *Server whitelist*: `/whitelist add|remove|list` (server owner only), applies in that server.

**Global ban** (`/gban`): bans a user in every server the bot shares with them, and auto-bans them on join anywhere else (and on sweep when the bot joins a new server). Server admins can opt out with `/gban config enforce:false`. Bans are tagged `[GBAN]` so `/gban remove` only lifts bans the system created. `/gban check` is open to bot staff and anyone with Ban Members.

**Flags** (`/flag`): severity-tagged notes (🟡 low / 🟠 medium / 🔴 high), either **server** flags (anyone with Moderate Members) or **global** flags (bot mod+). When a flagged user joins, an alert goes to your `/setlogs` channel; `/flag config` can also auto-timeout/kick/ban at a chosen level.

**Blacklists** (`/blacklist`):
- `bot`: bot admin+; the user can't use any command, button or modmail anywhere.
- `server`: Manage Server; blacklisted users are banned/kicked on join (`action`) and blocked from modmail and applications here.
- `word`: Manage Server; messages containing the word/phrase are deleted (staff and whitelisted users exempt).

> Slash commands are now registered **globally** (they may take a few minutes to appear the first time). Set `GUILD_ONLY=true` in `.env` for instant guild-only registration while testing.

## Adding features
Drop a new file in `modules/` exporting `{ commands: [{ data, execute }], init(client), onInteraction(i) }`. It's auto-loaded.

## Notes
- Data is stored in `data/db.json` (back it up). For huge servers, swap `lib/db.js` for SQLite/Mongo; the get/set API is tiny.
- Music relies on third-party YouTube extraction (`discord-player-youtubei`), which breaks when YouTube changes things. If `/play` fails, run `npm update discord-player-youtubei` or check its GitHub for fixes.
