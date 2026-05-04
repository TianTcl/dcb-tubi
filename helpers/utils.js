// Interpolated from TianTcl base JS v1.16.1, licensed under MIT

const unit2sec = [
	["year",	31536000],
	["month",	2592000],
	["week",	604800],
	["day",		86400],
	["hour",	3600],
	["minute",	60],
	["second",	1]
];
inDateRange = function(start, end) {
	const datetime = new Date(),
	chrono = {
		M: datetime.getMonth() + 1,
		D: datetime.getDate()
	}; var within_year = (
		(start[0] < end[0]) ||
		(start[0] == end[0] && start[1] <= end[1])
	), crossOverlap_year = (
		(start[0] > end[0]) ||
		(start[0] == end[0] && start[1] > end[1])
	); return (
		( // Start time check
			(chrono.M == start[0] && chrono.D >= start[1]) ||
			(within_year && chrono.M > start[0]) ||
			(crossOverlap_year && chrono.M != start[0])
		) && ( // End time check
			(chrono.M < end[0]) ||
			(chrono.M == end[0] && chrono.D <= end[1]) ||
			(chrono.M > end[0] && crossOverlap_year && (
				(chrono.M == start[0] && chrono.D >= start[1]) ||
				(chrono.M > start[0])
			))
		)
	);
},
inRange = inBetween = function(value, min, max, inclusive=true) {
	if (typeof value !== "number" || typeof min !== "number" || typeof max !== "number" || min > max) return false;
	return inclusive ?
		(min <= value && value <= max) :
		(min < value && value < max);
},
checkCond = function(value, condition, required=true, isMet=true, replace="#") {
	if (String(value).length == 0) return !required && isMet;
	var result = eval(condition.replaceAll(replace, JSON.stringify(value)));
	return result && isMet || !result && !isMet;
},
getTimestamp = function(format="Y-m-d H:i:s", time=null, timezone="UTC") {
	if (!format || !format.length) format = "Y-m-d H:i:s";
	const date = time ? new Date(time) : new Date();
	const match = timezone.match(/GMT([+-]\d{1,2})/);
	const tzOffset = match ? parseInt(match[1], 10) : 0;
	const utc = date.getTime() + (timezone == "UTC" ? date.getTimezoneOffset() * 6e4 : 0);
	const localDate = new Date(utc + tzOffset * 36e5);
	return format
		.replace("Y", localDate.getFullYear())
		.replace("m", String(localDate.getMonth() + 1).padStart(2, "0"))
		.replace("d", String(localDate.getDate()).padStart(2, "0"))
		.replace("H", String(localDate.getHours()).padStart(2, "0"))
		.replace("i", String(localDate.getMinutes()).padStart(2, "0"))
		.replace("s", String(localDate.getSeconds()).padStart(2, "0"));
},
range = function(...args) {
	// var size = args.length;
	// args = args.concat(Array(3 - size).fill(null));
	// var [start, stop, step] = [
	// 	[0, 0, 1],
	// 	[0, args[0], 1],
	// 	[args[0], args[1], 1],
	// 	args
	// ][size]; if (step == 0) step = 1;
	[start, stop, step] = args;
	if (start == undefined) start = 0;
	if (stop == undefined) { stop = start, start = 0; }
	if (step == undefined) step = 1;
	else if (step == 0) throw new Error("Step cannot be 0");
	return Array.from({
		length: Math.max(0, Math.ceil((stop - start) / step))
	}, (_, i) => start + i * step);
},
readDuration = function(duration, short=false, past=false, cut=2) {
	if (typeof duration !== "number" || duration < 0) return "";
	if (cut) cut = cut.bound(1, unit2sec.length - 1);
	if (past) {
		if (duration < (cut ? 60 : 1)) return "now";
		if (short && cut) {
			var sec;
			for (const [unit, msg] of [
				["day", "Yesterday"],
				["week", "Last week"],
				["month", "Last month"],
				["year", "Last year"]
			]) {
				sec = unit2sec.find(ec => ec[0] == unit)[1];
				if (duration >= sec && duration < 2 * sec) return msg;
			}
		}
	} var dur = [], per;
	for (const [unit, sec] of unit2sec) {
		per = Math.floor(duration / sec);
		if (!per) continue;
		dur.push(per + (short ? (unit == "month" ? "mo" : unit[0]) : ` ${unit}${per > 1 ? "s" : ""}`));
		duration %= sec;
	} return dur.slice(0, cut ? Math.min(dur.length, cut) : undefined)
		.join(" ") + (past ? " ago" : "");
},
number_format = function(number, decimal_places=2, locale="th-TH") {
	decimal_places = parseInt(decimal_places);
	if (decimal_places == NaN || decimal_places < 0) decimal_places = 0;
	return new Intl.NumberFormat(locale, {maximumFractionDigits: decimal_places}).format(number);
};

module.exports = {
	inDateRange,
	inRange,
	checkCond,
	getTimestamp,
	range,
	readDuration,
	number_format
};