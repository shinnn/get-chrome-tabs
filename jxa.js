'use strict';

function write(str) {
	$.NSFileHandle.fileHandleWithStandardOutput.writeData($(JSON.stringify(str)).dataUsingEncoding($.NSUTF8StringEncoding));
}

function run([id]) {
	const chrome = Application(id);

	if (!chrome.running()) {
		const appName = id.split('.').slice(2).map(str => `${str.charAt(0).toUpperCase()}${str.slice(1)}`).join(' ');

		write({
			appNotRunning: true,
			message: `Tried to get tabs of ${appName}, but ${appName} is currently not running.`
		});
		return;
	}

	const tabs = [];

	for (const [windowIndex, window] of chrome.windows().entries()) {
		const activeTabIndex = window.activeTabIndex() - 1;
		const windowVisible = window.visible();

		for (const [tabIndex, tab] of window.tabs().entries()) {
			tabs.push({
				windowIndex,
				windowVisible,
				url: tab.url(),
				title: tab.title(),
				active: activeTabIndex === tabIndex,
				loading: tab.loading()
			});
		}
	}

	write(tabs);
}
