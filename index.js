const { Client, GatewayIntentBits, Events } = require("discord.js");
const { REST, Routes } = require("discord.js");
const loader = require("./loader");

require("dotenv").config();

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

async function deployCommands(client) {
	const commands = loader.loadCommands(),
		rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

	try {
		console.log("Refreshing application (/) commands…");

		if (process.env.DEV_MODE !== "true") await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands }
		);
		else {
			var guilds = await client.guilds.fetch();
			for (const [guildId] of guilds)
				await rest.put(
					Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
					{ body: commands }
				);
		}

		console.log(`Registered ${commands.length} application (/) commands to ${guilds.size ?? "all"} guilds.`);
	} catch (err) {
		console.error(err);
	}

	console.log("[DEV] Commands auto-deployed.");
}

client.once("ready", async () => {
	console.log(`Logged in as ${client.user.tag}`);
	await deployCommands(client);
});

client.on(Events.InteractionCreate, async interaction => {
	await loader.handleInteraction(interaction);
});

client.on(Events.GuildMemberAdd, async member => {
	await loader.handleGuildMemberAdd(member);
});

client.login(process.env.TOKEN);