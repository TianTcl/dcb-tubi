const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = [
	new SlashCommandBuilder()
		.setName("name-change")
		.setDescription("Manage nickname changing system")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		// Configurations
		.addSubcommand(sub => sub
			.setName("set-default")
			.setDescription("Set default values for name change actions")
			.addIntegerOption(opt => opt
				.setName("limit")
				.setDescription("Default usage limit (-1 for infinite)")
				.setRequired(false)
				.setMinValue(-1)
			)
			.addIntegerOption(opt => opt
				.setName("cooldown")
				.setDescription("Cooldown in seconds between changes (0 for no cooldown)")
				.setRequired(false)
				.setMinValue(0)
			)
			.addBooleanOption(opt => opt
				.setName("impersonation")
				.setDescription("Allow impersonation")
				.setRequired(false)
			)
			.addStringOption(opt => opt
				.setName("title")
				.setDescription("Default title for the embed")
				.setRequired(false)
			)
			.addStringOption(opt => opt
				.setName("description")
				.setDescription("Default description for the embed")
				.setRequired(false)
			)
			.addStringOption(opt => opt
				.setName("colour")
				.setDescription("Hex colour (e.g. #F7A6F2)")
				.setRequired(false)
			)
		)
		.addSubcommand(sub => sub
			.setName("auto-role")
			.setDescription("Set a role to be automatically assigned/removed based on users' name change allowance")
			.addRoleOption(opt => opt
				.setName("role")
				.setDescription("Role to assign/remove (leave empty to disable)")
				.setRequired(false)
			)
		)
		// Instances
		.addSubcommand(sub => sub
			.setName("setup")
			.setDescription("Setup an actionable message for users to change their nickname")
			.addChannelOption(opt => opt
				.setName("channel")
				.setDescription("Channel to send the message to")
				.setRequired(true)
			)
			.addStringOption(opt => opt
				.setName("title")
				.setDescription("Custom title for the embed")
				.setRequired(false)
			)
			.addStringOption(opt => opt
				.setName("description")
				.setDescription("Custom description for the embed")
				.setRequired(false)
			)
			.addStringOption(opt => opt
				.setName("colour")
				.setDescription("Hex colour (e.g. #F7A6F2)")
				.setRequired(false)
			)
			.addBooleanOption(opt => opt
				.setName("impersonation")
				.setDescription("Allow impersonation")
				.setRequired(false)
			)
		)
		.addSubcommand(sub => sub
			.setName("edit")
			.setDescription("Edit the name change message for this server")
			.addStringOption(opt => opt
				.setName("message_id")
				.setDescription("Target message ID")
				.setRequired(true)
			)
			.addStringOption(opt => opt
				.setName("field")
				.setDescription("Field to edit")
				.setRequired(true)
				.addChoices(
					{ name: "title", value: "title" },
					{ name: "description", value: "description" },
					{ name: "colour", value: "colour" }
				)
			)
			.addStringOption(opt => opt
				.setName("value")
				.setDescription("New value")
				.setRequired(true)
			)
		)
		.addSubcommand(sub => sub
			.setName("delete")
			.setDescription("Delete the name change message (along with its configuration) for this server")
			.addStringOption(opt => opt
				.setName("message_id")
				.setDescription("Message ID to remove")
				.setRequired(true)
			)
		)
		// User controlling
		.addSubcommand(sub => sub
			.setName("add")
			.setDescription("Increment the allowance count for a user (if not infinite)")
			.addUserOption(opt => opt
				.setName("user")
				.setDescription("User to add allowance for")
				.setRequired(true)
			)
			.addIntegerOption(opt => opt
				.setName("amount")
				.setDescription("Amount to add to the user's allowance")
				.setRequired(true)
			)
		)
		.addSubcommand(sub => sub
			.setName("remove")
			.setDescription("Decrement the allowance count for a user (if not infinite)")
			.addUserOption(opt => opt
				.setName("user")
				.setDescription("User to remove allowance for")
				.setRequired(true)
			)
			.addIntegerOption(opt => opt
				.setName("amount")
				.setDescription("Amount to remove from the user's allowance")
				.setRequired(true)
			)
		)
		.addSubcommand(sub => sub
			.setName("reset")
			.setDescription("Reset a user's allowance count to the default")
			.addUserOption(opt => opt
				.setName("user")
				.setDescription("User to reset allowance for")
				.setRequired(true)
			)
			.addStringOption(opt => opt
				.setName("field")
				.setDescription("Field to reset")
				.setRequired(false)
				.addChoices(
					{ name: "used", value: "used" },
					{ name: "limit", value: "limit" }
				)
			)
		)
		.addSubcommand(sub => sub
			.setName("set-user-limit")
			.setDescription("Set a user's allowance count to a specific value. (-1 for infinite)")
			.addUserOption(opt => opt
				.setName("user")
				.setDescription("User to set limit for")
				.setRequired(true)
			)
			.addIntegerOption(opt => opt
				.setName("limit")
				.setDescription("New allowance limit for the user")
				.setRequired(true)
			)
		)
		.addSubcommand(sub => sub
			.setName("set-role-limit")
			.setDescription("Set a role users' allowance count to a specific value. (-1 for infinite)")
			.addRoleOption(opt => opt
				.setName("role")
				.setDescription("Role to set limit for")
				.setRequired(true)
			)
			.addIntegerOption(opt => opt
				.setName("limit")
				.setDescription("New allowance limit for the user")
				.setRequired(true)
			)
		)
		// Statistical
		.addSubcommand(sub => sub
			.setName("stats")
			.setDescription("View name change statistics for this server or a specific user")
			.addUserOption(opt => opt
				.setName("user")
				.setDescription("User to view statistics for")
				.setRequired(false)
			)
		)
		.addSubcommand(sub => sub
			.setName("history")
			.setDescription("View the name change history for this server")
			.addUserOption(opt => opt
				.setName("user")
				.setDescription("User to view history for")
				.setRequired(false)
			)
		)
];