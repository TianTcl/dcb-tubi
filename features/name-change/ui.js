const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require("discord.js");

function buildButton(instanceId) {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId(`name-change:${instanceId}:request`)
			.setLabel("Change Display Name")
			.setStyle(ButtonStyle.Secondary)
	);
}

function buildModal(instanceId) {
	const modal = new ModalBuilder()
		.setCustomId(`name-change:${instanceId}:submit`)
		.setTitle("Change Display Name");
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

module.exports = {
	buildButton,
	buildModal,
};