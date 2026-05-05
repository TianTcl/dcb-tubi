const { getGuild, saveGuild } = require("../../memory");
const { getUserState, canUse, recordUse, hasPrivilege } = require("./service");
const { buildButton, buildModal } = require("./ui");
const { EmbedBuilder } = require("discord.js");
const regex = require("../../helpers/regex");
const Utils = require("../../helpers/utils");

// Configurations
async function setDefault(interaction, guildId, data, config, instances) {
	const field = interaction.options.getString("field");
	switch (field) {
		case "limit":
			const limit = interaction.options.getInteger("limit");
			if (limit < -1) return interaction.reply({
				content: "Limit must be -1 (for infinite) or a non-negative integer.",
				ephemeral: true
			});
			config.limit = limit;
			break;
		case "cooldown":
			const cooldown = interaction.options.getInteger("cooldown");
			if (cooldown < 0) return interaction.reply({
				content: "Cooldown must be a non-negative integer.",
				ephemeral: true
			});
			config.cooldown = cooldown;
			break;
		case "impersonation":
			config.impersonation = interaction.options.getBoolean("impersonation");
			break;
		case "title":
			config.title = interaction.options.getString("title");
			break;
		case "description":
			config.description = interaction.options.getString("description");
			break;
		case "colour":
			const colour = interaction.options.getString("colour");
			if (colour && !regex.COLOUR_HEX.test(colour)) return interaction.reply({
				content: "Invalid colour format. Please provide a hex colour code (e.g. #F7A6BA).\nVisit https://htmlcolorcodes.com for reference.",
				ephemeral: true
			});
			config.colour = colour;
			break;
	}
	await saveGuild(guildId, data);
	switch (field) {
		case "limit":
			return interaction.reply({
				content: `Default limit set to ${config.limit == -1 ? "infinite" : config.limit} times.`,
				ephemeral: false
			});
			break;
		case "cooldown":
			return interaction.reply({
				content: `Default cooldown set to ${Utils.readDuration(config.cooldown)}.`,
				ephemeral: true
			});
			break;
		case "impersonation":
			return interaction.reply({
				content: `Default impersonation set to ${config.impersonation ? "enabled" : "disabled"}.`,
				ephemeral: false
			});
			break;
		case "colour":
			return interaction.reply({
				content: `Default embed colour set to ${config.colour || "none"}.`,
				ephemeral: false
			});
			break;
	}
}

// Instances
async function setup(interaction, guildId, data, config, instances) {
	const channel = interaction.options.getChannel("channel"),
		title = interaction.options.getString("title"),
		description = interaction.options.getString("description"),
		impersonation = interaction.options.getBoolean("impersonation");
	var colour = interaction.options.getString("colour");
	const instanceId = instances.length;

	// Validate inputs
	if (colour && !regex.COLOUR_HEX.test(colour)) {
		await interaction.reply({
			content: "Invalid colour format. Please provide a hex colour code (e.g. #F7A6BA).\nVisit https://htmlcolorcodes.com for reference.\nSetup will use default colour for now. You can change it later with the edit command.",
			ephemeral: true
		});
		colour = null;
	}

	const instance = {
		id: instanceId,
		channelId: channel.id,
		title: title || config.title,
		description: description || config.description,
		colour: colour || config.colour,
		impersonation: impersonation ?? config.impersonation
	};

	const embed = new EmbedBuilder()
		.setTitle(instance.title)
		.setDescription(instance.description)
		.setColor(instance.colour);
	const msg = await channel.send({
		embeds: [embed],
		components: [buildButton(instanceId)]
	});

	instance.messageId = msg.id;
	instances.push(instance);
	await saveGuild(guildId, data);

	return interaction.reply({
		content: `Setup complete in <#${channel.id}> with message ID ${msg.id}.`,
		ephemeral: false
	});
}

async function edit(interaction, guildId, data, config, instances) {
	const messageId = interaction.options.getString("message_id"),
		field = interaction.options.getString("field"),
		value = interaction.options.getString("value");

	const instance = instances.find(i => i.messageId === messageId);
	if (!instance) return interaction.reply({
		content: "Instance not found.",
		ephemeral: true
	});

	// Update saved data
	if (field === "colour" && value && !regex.COLOUR_HEX.test(value)) return interaction.reply({
		content: "Invalid colour format. Please provide a hex colour code (e.g. #F7A6BA).\nVisit https://htmlcolorcodes.com for reference.",
		ephemeral: true
	});
	instance[field] = value;
	await saveGuild(guildId, data);

	// Update message
	const channel = await interaction.client.channels.fetch(instance.channelId);
	const msg = await channel.messages.fetch(messageId);
	const embed = EmbedBuilder.from(msg.embeds[0])
		.setTitle(instance.title)
		.setDescription(instance.description)
		.setColor(instance.colour);
	msg.edit({ embeds: [embed] });

	return interaction.reply({ content: "Message has been updated.", ephemeral: true });
}

async function deleteInstance(interaction, guildId, data, config, instances) {
	const messageId = interaction.options.getString("message_id");

	const index = instances.findIndex(i => i.messageId === messageId);
	if (index === -1) return interaction.reply({ content: "Instance not found.", ephemeral: true });

	const instance = instances[index];
	const channel = await interaction.client.channels.fetch(instance.channelId);
	channel.messages.fetch(instance.messageId).then(msg => msg.delete()).catch(() => { });

	instances.splice(index, 1);
	await saveGuild(guildId, data);
	return interaction.reply({ content: "Instance removed.", ephemeral: false });
}

// User controlling
async function add(interaction, guildId, data, config, instances) {
	const user = interaction.options.getUser("user"),
		amount = interaction.options.getInteger("amount"),
		state = getUserState(data, user.id);

	if (state.limit > 0) state.limit += amount;

	await saveGuild(guildId, data);
	return interaction.reply({ content: `Added ${amount} to ${user.tag}'s limit.`, ephemeral: false });
}

async function remove(interaction, guildId, data, config, instances) {
	const user = interaction.options.getUser("user"),
		amount = interaction.options.getInteger("amount"),
		state = getUserState(data, user.id);

	if (state.limit > 0) state.limit = Math.max(0, state.limit - amount); // Ignoring if used will be more than limit

	await saveGuild(guildId, data);
	return interaction.reply({ content: `Removed ${amount} from ${user.tag}'s limit.`, ephemeral: false });
}

async function reset(interaction, guildId, data, config, instances) {
	const user = interaction.options.getUser("user"),
		field = interaction.options.getString("field");
		state = getUserState(data, user.id);

	if (field === "limit")
		state.used = 0;
	else if (field === "used")
		state.used = 0;
	// else if (field === "cooldown")
	// 	state.cooldown = 0;
	else {
		state.used = 0;
		state.limit = config.limit;
	}

	await saveGuild(guildId, data);
	return interaction.reply({ content: `User ${user.tag}'s name changing manifest has been reset.`, ephemeral: false });
}

async function setUserLimit(interaction, guildId, data, config, instances) {
	const user = interaction.options.getUser("user"),
		limit = interaction.options.getInteger("limit"),
		state = getUserState(data, user.id);

	state.limit = Math.max(-1, limit); // -1 for infinite

	await saveGuild(guildId, data);
	return interaction.reply({ content: `User ${user.tag}'s limit has been updated to ${state.limit < 0 ? "infinity" : state.limit}.`, ephemeral: false });
}

// Statistical
async function stats(interaction, guildId, data, config, instances) {
	const user = interaction.options.getUser("user") || interaction.user;

	if (interaction.user != user && !hasPrivilege(interaction, data)) return interaction.reply({
		content: "You do not have permission to view this user's stats.",
		ephemeral: true
	});

	const state = getUserState(data, user.id);

	return interaction.reply({
		content: `Used: ${state.used}\nLimit: ${state.limit}`,
		ephemeral: false
	});
}

async function history(interaction, guildId, data, config, instances) {
	const user = interaction.options.getUser("user") || interaction.user;

	if (interaction.user != user && !hasPrivilege(interaction, data)) return interaction.reply({
		content: "You do not have permission to view this user's history.",
		ephemeral: true
	});

	const state = getUserState(data, user.id),
		text = state.history.map(h => `${new Date(h.at).toLocaleString()} → ${h.name}`).join("\n") || "No history.";

	return interaction.reply({
		content: `Name change history (${user.tag}):\n${text}`,
		ephemeral: false
	});
}

module.exports = {
	setDefault,
	setup,
	deleteInstance,
	add,
	remove,
	reset,
	setUserLimit,
	stats,
	history
};