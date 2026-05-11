const { getGuild, saveGuild } = require("../../memory");
const { 
	getUserState,
	hasPrivilege,
	canUse,
	recordUse,
	getRemaining,
	isInfinite,
	getCooldownRemaining,
	getEffectiveLimit,
	validateName,
	normalizeName,
	syncAutoRole
} = require("./service");
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
		config = data.app["name-change"],
		instances = config.instance || [];

	if (interaction.isButton() && /name\-change:([A-Z0-9]+):request/i.test(interaction.customId)) {
		const instanceId = interaction.customId.match(/name\-change:([A-Z0-9]+):request/i)[1],
			instance = instances.find(i => i.id === instanceId),
			state = getUserState(data, interaction.user.id);
		if (!instance) return interaction.reply({
			content: "This name change request is no longer valid.",
			ephemeral: true
		});
		// Check eligibility
		if (!canUse(state, instance)) return interaction.reply({
			content: "You do not have permission to change your display name.",
			ephemeral: true
		});
		return interaction.showModal(buildModal(instanceId, state, config));
	}

	if (interaction.isModalSubmit() && /name\-change:([A-Z0-9]+):submit/i.test(interaction.customId)) {
		const instanceId = interaction.customId.match(/name\-change:([A-Z0-9]+):submit/i)[1],
			instance = instances.find(i => i.id === instanceId),
			newName = interaction.fields.getTextInputValue(`name-change:${instanceId}:input`),
			member = await interaction.guild.members.fetch(interaction.user.id),
			state = getUserState(data, interaction.user.id);
		if (!instance) return interaction.reply({
			content: "This name change request is no longer valid.",
			ephemeral: true
		});
		// Check eligibility
		if (!canUse(state, instance)) return interaction.reply({
			content: "You do not have permission to change your display name.",
			ephemeral: true
		});
		// Filter names
		const validation = validateName(newName, interaction.guild, config, instance);
		if (!validation.ok) return interaction.reply({
			content: validation.reason,
			ephemeral: true
		});
		// Complete action
		try {
			await member.setNickname(newName);
		} catch (err) {
			console.error(err);
			return interaction.reply({
				content: "I cannot change your nickname due to role hierarchy permissions.",
				ephemeral: true
			});
		}
		recordUse(state, newName);
		await saveGuild(guildId, data);
		await syncAutoRole(member, state, config);
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