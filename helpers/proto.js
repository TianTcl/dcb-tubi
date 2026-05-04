/*!
 * Library Name: Utilities modifier
 * Version: 1.4.1
 * Author: TianTcl
 * Author URL: https://TianTcl.net
 * License: MIT
 **/
// Edit JS prototypes
String.prototype.toProperCase = function() {
	return this.split(" ").map(ew => ew.split("-").map(ep => ep.charAt(0).toUpperCase() + ep.substring(1)).join("-")).join(" ");
};
String.prototype.toSentenceCase = function() {
	return this.split(". ").map(es => es.charAt(0).toUpperCase() + es.substring(1)).join(". ");
};
String.prototype.toCamelCase = function() {
	return this[0].toLowerCase() + this.toProperCase().substring(1).replace(/\W/g, "");
};
String.prototype.toSnailCase = function() {
	return this.toLowerCase().replace(/\W+/g, "_").replace(/(^_|_$)/g, "");
};
String.prototype.kebabToCamelCase = function() {
	return this.replace(/-([a-z])/g, g => g[1].toUpperCase());
};
String.prototype.toRandomCase = function() {
	return this.split("").map(char => Math.round(Math.random()) ? char.toUpperCase() : char.toLowerCase()).join("");
};
String.prototype.swapCase = function() {
	return this.split("").map(char => /[a-z]/.test(char) ? char.toUpperCase() : char.toLowerCase()).join("");
};
String.prototype.rotate13 = function() {
	return this.replace(/[a-z]/gi, char => String.fromCharCode(char.charCodeAt(0) + (char.toLowerCase() < "n" ? 13 : -13)));
};
Number.prototype.bound = function(min=0, max=100) {
	return Math.min(Math.max(this, min), max);
};
Number.prototype.inRange = function(min, max, inclusive=true) {
	if (inclusive) return this >= min && this <= max;
	return this > min && this < max;
};
String.prototype.shuffle = function() {
	return this.split("").shuffle().join("");
};
Function.prototype.subProp = function(property, value, replace=true) {
	if (!replace && this.hasOwnProperty(property)) return this;
	this[property] = value;
	return this;
};
Array.prototype.sum = function() {
	return this.reduce((total, next) => total + next, 0);
};
Array.prototype.max = function() {
	return Math.max(...this);
};
Array.prototype.min = function() {
	return Math.min(...this);
};
Array.prototype.unique = function() {
	return [...new Set(this)];
};
Array.prototype.shuffle = function() {
	// Fisher-Yates Shuffle
	var shuffled = [], amount = this.length, randomIdx;
	while (amount) {
		randomIdx = Math.floor(Math.random() * this.length);
		if (!(randomIdx in this)) continue;
		shuffled.push(this[randomIdx]);
		delete this[randomIdx];
		amount -= 1;
	} return shuffled;
};
Array.prototype.removeEmpty = function(numerical=false, blacklist=[null, "", undefined]) {
	if (numerical) blacklist.push(0, NaN, Infinity);
	return this.filter(value => !blacklist.includes(value));
};
Set.prototype.toArray = function() {
	return [...this];
};
Object.defineProperty(Object.prototype, "clone", {
	value: function(deep=false) {
		return deep ? JSON.parse(JSON.stringify(this)) : {...this};
	}, enumerable: false,
	configurable: true, writable: true
});
const mb_btoa = function(text, URLsafe) {
	text = btoa(new TextEncoder().encode(text).reduce(
		(s, b) => s + String.fromCharCode(b), "")
	); if (URLsafe) text = text.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	return text;
};