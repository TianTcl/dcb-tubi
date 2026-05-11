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
	if (interaction.isChatInputCommand()) {
		console.info(`User ${interaction.user.tag} executed command ${interaction.options.getSubcommandGroup(false) ? `${interaction.options.getSubcommandGroup(false)} ` : ""}${interaction.options.getSubcommand(false) ? `${interaction.options.getSubcommand(false)} ` : ""}${interaction.commandName}`);
		switch (interaction.commandName) {
			case "name-change":
				return nameChange.handleCommand(interaction);
				break;
		}
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

// Handle Events
async function handleGuildMemberAdd(member) {
	// Name change
	await nameChange.handleGuildMemberAdd(member);
};

module.exports = {
	handleInteraction,
	loadCommands,
	handleGuildMemberAdd
};