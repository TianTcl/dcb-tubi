const { execFile } = require("child_process");
const { promisify } = require("util");
const path = require("path");

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(__dirname, "..");

const NORMAL_INTERVAL	= 1000 * 60 * 60 * 24,	// 1 day
	CRASH_INTERVAL		= 1000 * 60 * 4,		// 4 minutes
	RECOVERY_TIME		= 1000 * 60 * 30;		// 30 minutes

let updating = null, fatalError = false, crashMode = false;
let updateTimer = null, recoveryTimer = null;

async function git(...args) {
	return execFileAsync("git", args, {
		cwd: ROOT,
		windowsHide: true
	});
}

async function checkForUpdates() {
	if (updating) return updating;

	updating = (async () => {
		try {
			console.log("[Updater] Checking for updates…");
			await git("fetch", "--all", "--prune");
			const { stdout } = await git("rev-list", "--count", "HEAD..@{u}");
			const commits = Number(stdout.trim());
			if (commits === 0) {
				console.log("[Updater] Already up to date.");
				return false;
			}
			console.log(`[Updater] Found ${commits} new commit(s).`);
			await git("merge", "--ff-only", "@{u}");
			console.log("[Updater] Update completed successfully.");
			return true;
		} catch (error) {
			console.error(
				"[Updater] Update failed:",
				error.stderr || error.message
			);
			return false;
		}
	})();
	try {
		return await updating;
	} finally {
		updating = null;
	}
}

function scheduleUpdateCheck(interval) {
	clearInterval(updateTimer);
	updateTimer = setInterval(checkForUpdates, interval);
}

function enterCrashMode() {
	crashMode = true;
	console.log("[Updater] Entering crash mode (4-minute checks).");

	scheduleUpdateCheck(CRASH_INTERVAL);
	clearTimeout(recoveryTimer);
	recoveryTimer = setTimeout(() => {
		crashMode = false;
		console.log("[Updater] No crashes for 30 minutes. Returning to normal mode.");
		scheduleUpdateCheck(NORMAL_INTERVAL);
	}, RECOVERY_TIME);
}

function startUpdater() {
	console.log("[Updater] Automatic updates enabled (24-hour checks).");
	scheduleUpdateCheck(NORMAL_INTERVAL);

	process.on("uncaughtException", async (error) => {
		if (fatalError) return;
		fatalError = true;
		console.error("[Fatal Error]", error);
		enterCrashMode();
		await checkForUpdates();
		process.exit(1);
	});
	process.on("unhandledRejection", async (reason) => {
		if (fatalError) return;
		fatalError = true;
		console.error("[Unhandled Rejection]", reason);
		enterCrashMode();
		await checkForUpdates();
		process.exit(1);
	});
}

module.exports = {
	checkForUpdates,
	startUpdater
};