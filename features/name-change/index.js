const { getGuild, saveGuild } = require("../../memory");
const { getUserState, canUse, recordUse, hasPrivilege } = require("./service");
const { buildButton, buildModal } = require("./ui");
const handle = require("./handle");
require("../../helpers/proto");

async function handleCommand(interaction) {
	const sub = interaction.options.getSubcommand(),
		guildId = interaction.guildId,
		data = await getGuild(guildId),
		config = data.app["name-change"],
		instances = config.instance;

	if (!["stats", "history"].includes(sub)) {
		if (!hasPrivilege(interaction, data)) return interaction.reply({
			content: "You do not have permission to manage nicknames.",
			ephemeral: true
		});
	}

	// Kebab to camel case for function mapping
	var funcName = sub.kebabToCamelCase();
	if (funcName === "delete") funcName += "Instance";
	if (typeof handle[funcName] !== "function")
		return interaction.reply({
			content: "Unknown subcommand.",
			ephemeral: true
		});
	return await handle[funcName](interaction, guildId, data, config, instances);
}

async function handleInteraction(interaction) {
	const guildId = interaction.guildId,
		data = await getGuild(guildId),
		instances = data.app["name-change"].instance || [];

	if (interaction.isButton() && /name\-change:(\d+):request/.test(interaction.customId)) {
		const instanceId = interaction.customId.match(/name\-change:(\d+):request/)[1],
			state = getUserState(data, interaction.user.id);
		// Check eligibility
		if (!canUse(state, instances[instanceId])) return interaction.reply({
			content: "You do not have permission to change your display name.",
			ephemeral: true
		});
		return interaction.showModal(buildModal(instanceId));
	}

	if (interaction.isModalSubmit() && /name\-change:(\d+):submit/.test(interaction.customId)) {
		const instanceId = interaction.customId.match(/name\-change:(\d+):submit/)[1],
			newName = interaction.fields.getTextInputValue(`name-change:${instanceId}:input`),
			member = await interaction.guild.members.fetch(interaction.user.id),
			state = getUserState(data, interaction.user.id);
		// Check eligibility
		if (!canUse(state, instances[instanceId])) return interaction.reply({
			content: "You do not have permission to change your display name.",
			ephemeral: true
		});
		// Filter names
		// TODO: filter for bad words.
		var impersionation = instances[instanceId].impersonation ?? config.impersionation;
		if (!impersionation) {
			// TODO: Implement actual impersonation check
			// - Check against guild members' usernames and nicknames
			// - Check against common names (e.g. "Admin", "Moderator")
		}
		// Complete action
		await member.setNickname(newName);
		recordUse(state, newName);
		await saveGuild(guildId, data);
		return interaction.reply({
			content: `Your display name has been updated to **${newName}**.`,
			ephemeral: true
		});
	}
}

module.exports = {
	handleCommand,
	handleInteraction
};