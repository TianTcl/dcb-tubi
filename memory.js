const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PSWD,
	database: process.env.DB_NAME
});

async function getGuild(guildId) {
	const [rows] = await pool.query(
		"SELECT data FROM tubi_data WHERE guild_id=?",
		[guildId]
	);
	if (rows.length) return rows[0].data;
	// Initialize default data if not exists
	const base = {
		config: {},
		app: {
			"name-change": {
				limit: 1,
				cooldown: 7*24*60*60, // 7 days
				impersonation: true,
				instance: []
			}
		},
		user: {}
	};
	await pool.query(
		"INSERT INTO tubi_data (guild_id,data) VALUE (?, ?)",
		[guildId, JSON.stringify(base)]
	);
	return base;
}

async function saveGuild(guildId, data) {
	await pool.query(
		"UPDATE tubi_data SET data=? WHERE guild_id=?",
		[JSON.stringify(data), guildId]
	);
}

module.exports = {
	getGuild,
	saveGuild
};