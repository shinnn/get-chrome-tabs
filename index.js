'use strict';

if (process.platform === 'darwin') {
	const {inspect, promisify} = require('util');
	const {execFile} = require('child_process');

	const inspectWithKind = require('inspect-with-kind');
	const isPlainObj = require('is-plain-obj');

	const APP_ERROR = 'Expected `app` option to be either \'canary\' or \'chromium\'';
	const execFileOption = {timeout: 10000};
	const nameIdMap = new Map([
		['canary', 'com.google.Chrome.canary'],
		['chromium', 'org.chromium.Chromium']
	]);
	const promisifiedExecFile = promisify(execFile);

	module.exports = async function getChromeTabs(...args) {
		const argLen = args.length;
		const [option = {}] = args;

		if (argLen === 1) {
			if (!isPlainObj(option)) {
				throw new TypeError(`Expected an <Object> to specify get-chrome-tabs option, but got ${
					inspectWithKind(option)
				}.`);
			}

			if (option.app !== undefined) {
				if (typeof option.app !== 'string') {
					throw new TypeError(`${APP_ERROR}, but got a non-string value ${inspectWithKind(option.app)}.`);
				}

				if (!nameIdMap.has(option.app)) {
					throw new RangeError(`${APP_ERROR}, but got neither of them ${inspect(option.app)}.`);
				}
			}
		} else if (argLen !== 0) {
			throw new RangeError(`Expected 0 or 1 argument ([<Object>]), but got ${argLen} arguments.`);
		}

		const id = nameIdMap.get(option.app) || 'com.google.Chrome';
		const result = JSON.parse((await promisifiedExecFile('osascript', [
			'-l',
			'JavaScript',
			require.resolve('./jxa.js'),
			id
		], execFileOption)).stdout);

		if (result.appNotRunning) {
			const error = new Error(result.message);
			error.code = 'ERR_APP_NOT_RUNNING';
			error.bundleId = id;

			throw error;
		}

		return result;
	};
} else {
	const platformName = require('platform-name');

	module.exports = async function getChromeTabs() {
		const error = new Error(`get-chrome-tabs only supports macOS, but the current platform is ${
			platformName()
		}.`);
		error.code = 'ERR_UNSUPPORTED_PLATFORM';

		throw error;
	};
}
