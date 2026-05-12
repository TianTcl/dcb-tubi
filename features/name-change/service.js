require("../../helpers/proto");
const regex = require("../../helpers/regex");
const Utils = require("../../helpers/utils");

function getUserState(data, userId) {
	const config = data.app["name-change"];
	data.user[userId] ??= {};
	data.user[userId]["name-change"] ??= {
		used: 0,
		limit: null,
		history: []
	};
	return data.user[userId]["name-change"];
}

function hasPrivilege(interaction, data) {
	return interaction.member.permissions.has("MANAGE_NICKNAMES")
		|| interaction.member.permissions.has("Administrator");
}

function canUse(state, config) {
	if (!config) return false;
	const now = Date.now(),
		limit = getEffectiveLimit(state, config);
	return !(
		(limit >= 0 && state.used >= limit) ||
		(config.cooldown && state.history.length && now - state.history.at(-1).at < config.cooldown * 1e3)
	);
}

function recordUse(state, newName) {
	state.used += 1;
	state.history.push({
		name: newName,
		at: Date.now()
	});
}

function getRemaining(state, config) {
	const limit = getEffectiveLimit(state, config);
	if (isInfinite(state, config)) return Infinity;
	return Math.max(0, limit - state.used);
}

function isInfinite(state, config) {
	return getEffectiveLimit(state, config) < 0;
}

function getCooldownRemaining(state, config) {
	if (!config.cooldown || !state.history.length) return 0;
	const now = Date.now();
	const end = state.history.at(-1).at + config.cooldown * 1e3;
	return Math.max(0, end - now);
}

function getEffectiveLimit(state, config) {
	return state.limit ?? config.limit;
}

function normalizeName(name) {
	return name.trim().toCamelCase().toLowerCase();
}

async function validateName(newName, guild, config, instance) {
	const norm = normalizeName(newName);
	if (!Utils.inBetween(norm.length, 1, 32)) return {
		ok: false,
		reason: "Display name must be between 1 and 32 characters long."
	};
	if (regex.MENTION_DISCORD.test(norm)) return {
		ok: false,
		reason: "Display name cannot contain user or role mentions."
	};
	// TODO: filter for bad words.
	
	const impersonation = instance.impersonation ?? config.impersonation;
	if (!impersonation) {
		if (regex.COMMON_STAFF_NAMES.test(norm)) return {
			ok: false,
			reason: "Staff-like names are not allowed."
		};
		const members = await guild.members.fetch(),
			conflict = members.values().any(m => !m.user.bot && (
				normalizeName(m.user.username) === norm ||
				(m.nickname && normalizeName(m.nickname) === norm)
		)) || await guild.roles.fetch().any(r => normalizeName(r.name) === norm);
		if (conflict) return {
			ok: false,
			reason: "Display name cannot impersonate another user in the server."
		};
	}
	return { ok: true };
}

async function syncAutoRole(user, state, config, interaction=null) {
	if (!config.autoRole) return;
	const member = interaction == null ? user : await interaction.guild.members.fetch(user.id);
	if (member.user.bot) return;
	const role = member.guild.roles.cache.get(config.autoRole);
	if (!role) return;
	const remaining = getRemaining(state, config);
	if (remaining === Infinity || remaining > 0) {
		if (!member.roles.cache.has(role.id))
			await member.roles.add(role).catch(() => {});
	} else {
		if (member.roles.cache.has(role.id))
			await member.roles.remove(role).catch(() => {});
	}
}

async function syncAllAutoRoles(guild, data, config) {
	const members = await guild.members.fetch(),
		tasks = [];
	for (const member of members.values()) {
		if (member.user.bot) continue;
		const state = getUserState(data, member.id);
		tasks.push(() => syncAutoRole(member, state, config));
	}
	await bulkSyncAutoRole(tasks);
}

function bulkSyncAutoRole(tasks, batchSize=5) {
	for (let i = 0; i < tasks.length; i += batchSize) {
		const chunk = tasks.slice(i, i + batchSize).map(fn => fn());
		await Promise.all(chunk);
	}
}

module.exports = {
	getUserState,
	hasPrivilege,
	canUse,
	recordUse,
	getRemaining,
	isInfinite,
	getCooldownRemaining,
	getEffectiveLimit,
	normalizeName,
	validateName,
	syncAutoRole,
	syncAllAutoRoles,
	bulkSyncAutoRole
};