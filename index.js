require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits: I, Partials, Collection, REST, Routes, ActivityType } = require('discord.js');
const db = require('./lib/db');
const { EPH } = require('./lib/util');
const perms = require('./lib/perms');

db.load();

const client = new Client({
  intents: [
    I.Guilds, I.GuildMembers, I.GuildMessages, I.MessageContent, I.GuildVoiceStates,
    I.GuildModeration, I.GuildWebhooks, I.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.commands = new Collection();
const modules = [];

for (const file of fs.readdirSync(path.join(__dirname, 'modules')).filter((f) => f.endsWith('.js'))) {
  const mod = require(`./modules/${file}`);
  modules.push(mod);
  for (const c of mod.commands || []) client.commands.set(c.data.name, c);
  mod.init?.(client);
}

client.once('clientReady', async () => {
  client.user.setActivity('/help', { type: ActivityType.Listening });
  const rest = new REST().setToken(process.env.TOKEN);
  const body = client.commands.map((c) => c.data.toJSON());
  try {
    // Global/gban/flag/staff systems span servers, so commands are registered globally by default.
    // GUILD_ONLY=true registers only in GUILD_ID (instant updates, handy while developing).
    if (process.env.GUILD_ONLY === 'true' && process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body });
      await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
    } else {
      await rest.put(Routes.applicationCommands(client.user.id), { body });
      if (process.env.GUILD_ID) await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: [] }).catch(() => {});
    }
    console.log(`Online as ${client.user.tag} | ${body.length} commands registered`);
  } catch (e) { console.error('Command registration failed:', e); }
});

client.on('interactionCreate', async (i) => {
  try {
    if (perms.isBotBlacklisted(i.user.id)) {
      if (i.isRepliable()) await i.reply({ content: '⛔ You are blacklisted from using this bot.', flags: EPH });
      return;
    }
    if (i.isAutocomplete()) return void (await client.commands.get(i.commandName)?.autocomplete?.(i));
    if (i.isChatInputCommand()) {
      const cmd = client.commands.get(i.commandName);
      if (!cmd) return;
      if (!i.guild && !cmd.dmAllowed) return i.reply({ content: 'Use this in a server.', flags: EPH });
      return void (await cmd.execute(i, client));
    }
    for (const m of modules) if (await m.onInteraction?.(i, client)) return;
  } catch (e) {
    console.error(e);
    const msg = { content: 'Something went wrong running that.', flags: EPH };
    if (i.deferred || i.replied) i.followUp(msg).catch(() => {}); else i.reply(msg).catch(() => {});
  }
});

process.on('unhandledRejection', (e) => console.error('Unhandled:', e));
client.login(process.env.TOKEN);
