module.exports = [
	new SlashCommandBuilder()
		.setName("configure")
		.setDescription("Manage 兔ฺBI bot configurations")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		// Sub commands
		.addSubcommand(sub => sub
			.setName("reset")
			.setDescription("Reset all server data\nThis will purge all data including user data and histories.")
			.addStringOption(opt => opt
				.setName("confirm")
				.setDescription("Type \"PURGE\" to confirm")
				.setRequired(true)
			)
		)
];