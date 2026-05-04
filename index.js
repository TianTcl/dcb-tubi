const { Client, GatewayIntentBits, Events } = require("discord.js");
const loader = require("./loader");

require("dotenv").config();

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	await loader.handleInteraction(interaction);
});

client.login(process.env.TOKEN);