const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	EmbedBuilder
} = require("discord.js");
const { 
	getUserState,
	hasPrivilege,
	canUse,
	recordUse,
	getRemaining,
	isInfinite,
	getCooldownRemaining,
	getEffectiveLimit
} = require("./service");

function buildButton(instanceId) {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId(`name-change:${instanceId}:request`)
			.setLabel("Change Display Name")
			.setStyle(ButtonStyle.Secondary)
	);
}

function buildModal(instanceId, state, config) {
	const remaining = isInfinite(state, config) ? "∞" : getRemaining(state, config);
	const modal = new ModalBuilder()
		.setCustomId(`name-change:${instanceId}:submit`)
		.setTitle(`Change Display Name (${remaining} left)`);
	const input = new TextInputBuilder()
		.setCustomId(`name-change:${instanceId}:input`)
		.setLabel("New name")
		.setStyle(TextInputStyle.Short)
		.setMinLength(1)
		.setMaxLength(32)
		.setRequired(true);
	modal.addComponents(new ActionRowBuilder().addComponents(input));
	return modal;
}

function buildEmbed(instance) {
	const embed = new EmbedBuilder()
		.setTitle(instance.title)
		.setDescription(instance.description)
		.setColor(instance.colour || "#F7A6F2");

	if (instance.banner)
		embed.setImage(instance.banner);

	if (instance.footer)
		embed.setFooter({
			text: instance.footer
		});

	return embed;
}

module.exports = {
	buildButton,
	buildModal,
	buildEmbed
};