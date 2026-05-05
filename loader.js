const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Import commands
function loadCommands() {
	const commands = [];

	const nc = require("./features/name-change/command");
	commands.push(...nc);

	return commands.map(cmd => cmd.toJSON());
}

// Interaction routing
const nameChange = require("./features/name-change");

async function handleInteraction(interaction) {
	// Slash commands
	if (interaction.isChatInputCommand()) switch (interaction.commandName) {
		case "name-change":
			return nameChange.handleCommand(interaction);
			break;
	}
	// Components
	if (interaction.isButton() || interaction.isModalSubmit()) {
		return nameChange.handleInteraction(interaction);
	}
	return interaction.reply({
		content: "Unknown command :(",
		ephemeral: true
	});
}

module.exports = {
	handleInteraction,
	loadCommands
};