const { Client, GatewayIntentBits, Events } = require("discord.js");
const loader = require("./loader");
require("./src/updater").startUpdater();

require("dotenv").config();

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", async () => {
	console.log(`Logged in as ${client.user.tag}`);
	await loader.deployCommands(client);
});

client.on(Events.InteractionCreate, async interaction => {
	await loader.handleInteraction(interaction);
});

client.on(Events.GuildMemberAdd, async member => {
	await loader.handleGuildMemberAdd(member);
});

client.on("guildCreate", async guild => {
	try {
		await loader.deployGuildCommands(client, guild.id);
		console.log(`Commands deployed to "${guild.name}" (${guild.id}).`);
	} catch (err) {
		console.error(`Failed to deploy commands to guild ${guild.id}:`, err);
	}
});

client.login(process.env.TOKEN);