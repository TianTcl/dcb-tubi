const { getGuild, saveGuild, purgeGuild } = require("../../memory");

async function reset(interaction, guildId, data, config, instances) {
	const confirm = interaction.options.getString("confirm");
	if (confirm !== "PURGE") return interaction.reply({
		content: "This action is destructive.\nYou must type `PURGE` in the confirm field to confirm.",
		ephemeral: true
	});
	await purgeGuild(guildId);
	return interaction.reply({
		content: "All guild configuration and user data have been reset.",
		ephemeral: false
	});
}

module.exports = {
	reset
};