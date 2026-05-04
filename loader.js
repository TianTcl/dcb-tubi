const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
requirer("dotenv").config();

// Import commands
var commands = [];

const nc = require("./features/name-change/command");
commands.push(nc);

commands = commands.map(cmd => cmd.toJSON());

const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

(async () => {
	try {
		console.log("Refreshing application (/) commands…");

		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands }
		);

		console.log("Registered application (/) commands.");
	} catch (err) {
		console.error(err);
	}
})();

// Interaction routing
const nameChange = require("./features/name-change");

async function handleInteraction(interaction) {
	if (interaction.isChatInputCommand()) switch (interaction.commandName) {
		case "name-change":
			return nameChange.handleCommand(interaction);
			break;
	}
	return interaction.reply({
		content: "Unknown command :(",
		ephemeral: true
	});
}

module.exports = {
	handleInteraction
};