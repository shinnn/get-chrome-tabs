'use strict';

if (process.platform === 'darwin') {
	const inspect = require('util').inspect;

	const getStdout = require('execa').stdout;
	const inspectWithKind = require('inspect-with-kind');
	const isPlainObj = require('is-plain-obj');

	const APP_ERROR = 'Expected `app` option to be either \'canary\' or \'chromium\'';
	const nameIdMap = new Map([
		['canary', 'com.google.Chrome.canary'],
		['chromium', 'org.chromium.Chromium']
	]);

	module.exports = function getChromeTabs(option) {
		if (option !== undefined) {
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
		} else {
			option = {};
		}

		const id = nameIdMap.get(option.app) || 'com.google.Chrome';

		return getStdout('osascript', [
			'-l',
			'JavaScript',
			require.resolve('./jxa.js'),
			id
		]).then(stdout => { // eslint-disable-line promise/prefer-await-to-then
			const result = JSON.parse(stdout);

			if (result.appNotRunning) {
				const error = new Error(result.message);
				error.code = 'ERR_APP_NOT_RUNNING';
				error.bundleId = id;

				throw error;
			}

			return result;
		});
	};

	/*
	const re = /(?<=___###___message___###___).*(?=___###___message___###___)/;

	module.exports = async function getChromeTabs(option) {
		const message = (await getStderr('osascript', [
			'-l',
			'JavaScript',
			require.resolve('./jxa.js'),
			'com.Google.Chrome.canary'
		])).match(re);

		try {
			return JSON.parse(message);
		} catch {
			throw new Error(message);
		}
	};
	*/
} else {
	module.exports = function getChromeTabs() {
		const platformName = require('platform-name');

		const error = new Error(`get-chrome-tabs only supports macOS, but the current platform is ${
			platformName()
		}.`);
		error.code = 'ERR_UNSUPPORTED_PLATFORM';

		return Promise.reject(error);
	};
}
