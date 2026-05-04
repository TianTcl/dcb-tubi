function getUserState(data, userId) {
	if (!data.user[userId]) {
		data.user[userId] = {
			"name-change": {
				used: 0,
				limit: 1,
				history: []
			}
		};
	}
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
	const now = Date.now();
	return !(
		(state.limit >= 0 && state.used >= state.limit) ||
		(config.cooldown && state.history.length && now - state.history.at(-1).at < config.cooldown)
	);
}

function recordUse(state, newName) {
	state.used += 1;
	state.history.push({
		name: newName,
		at: Date.now()
	});
}

module.exports = {
	getUserState,
	hasPrivilege,
	canUse,
	recordUse
};