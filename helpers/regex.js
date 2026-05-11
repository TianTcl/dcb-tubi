const regexes = {
	COLOUR_HEX: /^#?([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i,
	MENTION_DISCORD: /discord|everyone|here/i,
	COMMON_STAFF_NAMES: /mod(erator)?|admin(istrator)?|owner|staff|support|help(er)?|dev(eloper)?|manager|founder|ceo|lead|head|director|officer|sys(tem( admin)?|op|admin)?|comm(unity)? ?(manager|mod(erator)?)?/i
};

module.exports = {
	...regexes
};