const { getGuild, saveGuild, purgeGuild } = require("../../memory");
const handle = require("./handle");
require("../../helpers/proto");

async function handleCommand(interaction) {
	const sub = interaction.options.getSubcommand(),
		guildId = interaction.guildId,
		data = await getGuild(guildId),
		config = data.app["name-change"],
		instances = config.instance;

	if (!hasPrivilege(interaction, data)) return interaction.reply({
		content: "You do not have permission to configure this bot.",
		ephemeral: true
	});

	// Kebab to camel case for function mapping
	var funcName = sub.kebabToCamelCase();
	if (typeof handle[funcName] !== "function")
		return interaction.reply({
			content: "Unknown subcommand.",
			ephemeral: true
		});
	return await handle[funcName](interaction, guildId, data, config, instances);
}

module.exports = {
	handleCommand
};