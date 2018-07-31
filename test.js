'use strict';

const {createServer} = require('http');
const {promisify} = require('util');

const getChromeTabs = require('.');
const clearModule = require('clear-module');
const compact = require('lodash/compact');
const last = require('lodash/last');
const map = require('lodash/map');
const pretendPlatform = require('pretend-platform');
const puppeteer = require('puppeteer');
const test = require('tape');

test('getChromeTabs()', async t => {
	const server = createServer((req, res) => {
		const title = last(compact(req.url.split('/')));
		res.writeHead(200, {
			'content-type': 'text/html',
			'content-length': 69 + title.length
		});

		res.end(`<!doctype html><html><head><title>${title}</title></head><body></body></html>`);
	});

	await promisify(server.listen.bind(server))(3018);

	const browser = await puppeteer.launch({
		headless: false,
		args: ['http://127.0.0.1:3018/foo/']
	});

	const context = await browser.createIncognitoBrowserContext({headless: false});

	try {
		await (await context.newPage()).goto('http://127.0.0.1:3018/bar/');
		await (await context.newPage()).goto('http://127.0.0.1:3018/baz/');

		const tabs = await getChromeTabs({app: 'chromium'});

		t.equal(
			tabs.length,
			3,
			'should list open Chrome tabs.'
		);

		t.deepEqual(
			map(tabs, 'windowIndex'),
			[0, 0, 1],
			'should set number of window order to each item.'
		);

		t.deepEqual(
			map(tabs, 'url'),
			['http://127.0.0.1:3018/bar/', 'http://127.0.0.1:3018/baz/', 'http://127.0.0.1:3018/foo/'],
			'should set page URL to each item.'
		);

		t.deepEqual(
			map(tabs, 'title'),
			['bar', 'baz', 'foo'],
			'should set page title to each item.'
		);

		t.deepEqual(
			map(tabs, 'active'),
			[false, true, true],
			'should set tab active state to each item.'
		);
	} catch (err) {
		t.fail(err.stack);
	} finally {
		await Promise.all([
			browser.close(),
			promisify(server.close.bind(server))()
		]);
	}

	try {
		await getChromeTabs();
		t.fail('Unexpectedly succeeded.');
	} catch (err) {
		t.equal(
			err.toString(),
			'Error: Tried to get tabs of Chrome, but Chrome is currently not running.',
			'should fail when Chrome is not running.'
		);
	}

	t.end();
});

test('Argument validation', async t => {
	const fail = t.fail.bind(t, 'Unexpectedly succeeded.');

	try {
		await getChromeTabs(new Uint32Array());
		fail();
	} catch (err) {
		t.equal(
			err.toString(),
			'TypeError: Expected an <Object> to specify get-chrome-tabs option, but got Uint32Array [  ].',
			'should fail when it takes a non-object argument.'
		);
	}

	try {
		await getChromeTabs({app: -0});
		fail();
	} catch (err) {
		t.equal(
			err.toString(),
			'TypeError: Expected `app` option to be either \'canary\' or \'chromium\', but got a non-string value -0 (number).',
			'should fail when `app` option is not a string.'
		);
	}

	try {
		await getChromeTabs({app: 'dartium'});
		fail();
	} catch (err) {
		t.equal(
			err.toString(),
			'RangeError: Expected `app` option to be either \'canary\' or \'chromium\', but got neither of them \'dartium\'.',
			'should fail when `app` option is an unsupported value.'
		);
	}

	try {
		await getChromeTabs({}, {});
		fail();
	} catch (err) {
		t.equal(
			err.toString(),
			'RangeError: Expected 0 or 1 argument ([<Object>]), but got 2 arguments.',
			'should fail when it takes too many arguments.'
		);
	}

	t.end();
});

test('getChromeTabs() where `osascript` command doesn\'t exist', async t => {
	process.env.PATH = '/none/exists';

	try {
		await require('.')({});
	} catch ({code}) {
		t.equal(
			code,
			'ENOENT',
			'should fail.'
		);
	}

	t.end();
});

test('getChromeTabs() on a non-macOS environment', async t => {
	clearModule('.');
	pretendPlatform('linux');

	try {
		await require('.')();
	} catch (err) {
		t.equal(
			err.toString(),
			'Error: get-chrome-tabs only supports macOS, but the current platform is Linux.',
			'should fail.'
		);
	}

	t.end();
});
