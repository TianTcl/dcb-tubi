const fs = require("fs");
const path = require("path");
require("dotenv").config();
require("./helpers/proto");

// Import commands
function loadCommands() {
	const featuresPath = path.join(__dirname, "features"),
		commands = [];

	const featuresFolders = fs.readdirSync(featuresPath, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);

	for (const feature of featuresFolders) {
		const commandPath = path.join(featuresPath, feature, "command.js");
		if (!fs.existsSync(commandPath)) continue;

		const featureCommands = require(`./features/${feature}/command`);
		commands.push(...featureCommands);
	}

	return commands.map(cmd => cmd.toJSON());
}

// Interaction routing
const features = {};
(() => {
	const featuresPath = path.join(__dirname, "features");
	const featuresFolders = fs.readdirSync(featuresPath, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);
	for (const feature of featuresFolders) {
		const entryPath = path.join(featuresPath, feature, "index.js");
		if (!fs.existsSync(entryPath)) continue;

		features[feature.kebabToCamelCase()] = require(`./features/${feature}`);
	}
})();

async function handleInteraction(interaction) {
	// Slash commands
	if (interaction.isChatInputCommand()) {
		console.info(`User ${interaction.user.tag} executed command ${interaction.options.getSubcommandGroup(false) ? `${interaction.options.getSubcommandGroup(false)} ` : ""}${interaction.options.getSubcommand(false) ? `${interaction.options.getSubcommand(false)} ` : ""}${interaction.commandName}`);
		// Kebab to camel case for feature mapping
		var featName = interaction.commandName.kebabToCamelCase();
		if (typeof features[featName]?.handleCommand !== "function")
			return interaction.reply({
				content: "Unknown command :(",
				ephemeral: true
			});
		return await features[featName].handleCommand(interaction);
	}
	// Components
	if (interaction.isButton() || interaction.isModalSubmit()) {
		return features["nameChange"].handleInteraction(interaction);
	}
	return interaction.reply({
		content: "兔BI does not know how to handle this interaction :(",
		ephemeral: true
	});
}

// Handle Events
async function handleGuildMemberAdd(member) {
	// Name change
	await features["nameChange"].handleGuildMemberAdd(member);
};

module.exports = {
	handleInteraction,
	loadCommands,
	handleGuildMemberAdd
};