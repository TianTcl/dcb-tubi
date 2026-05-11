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
	if (!interaction.member.permissions.has("MANAGE_NICKNAMES"))
		return false;
	if (!interaction.member.permissions.has("Administrator"))
		return false;
	return true;
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

function validateName(newName, guild, config, instance) {
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
		const conflict = guild.members.cache.any(m => !m.user.bot && (
				normalizeName(m.user.username) === norm ||
				(m.nickname && normalizeName(m.nickname) === norm)
		)) || guild.roles.cache.any(r => normalizeName(r.name) === norm);
		if (conflict) return {
			ok: false,
			reason: "Display name cannot impersonate another user in the server."
		};
	}
	return { ok: true };
}

async function syncAutoRole(member, state, config) {
	if (!config.autoRole) return;
	const role = await member.guild.roles.cache.get(config.autoRole);
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
	for (const member of guild.members.cache.values()) {
		if (member.user.bot) continue;
		const state = getUserState(data, member.id);
		await syncAutoRole(member, state, config);
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
	syncAllAutoRoles
};