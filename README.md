# get-chrome-tabs

[![npm version](https://img.shields.io/npm/v/get-chrome-tabs.svg)](https://www.npmjs.com/package/get-chrome-tabs)
[![Build Status](https://travis-ci.com/shinnn/get-chrome-tabs.svg?branch=master)](https://travis-ci.com/shinnn/get-chrome-tabs)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/get-chrome-tabs.svg)](https://coveralls.io/github/shinnn/get-chrome-tabs?branch=master)

<img src="screenshot.png" align="right" width="460">

Get information of the currently opened [Chrome](https://www.google.cm/chrome/) tabs, for example URLs and titles

&nbsp;

```javascript
const getChromeTabs = require('get-chrome-tabs');

(async () => getChromeTabs() /* => [
  {
    windowIndex: 0,
    windowVisible: true,
    url: 'https://github.com/',
    title: 'GitHub',
    active: true,
    loading: false
  },
  {
    windowIndex: 0,
    windowVisible: true,
    url: 'https://www.npmjs.com/package/get-chrome-tabs',
    title: 'get-chrome-tabs - npm',
    active: false,
    loading: false
  },
  {
    windowIndex: 1,
    windowVisible: true,
    url: 'https://example.org/',
    title: 'Example Domain',
    active: true,
    loading: false
  }
] */)();
```

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/getting-started/what-is-npm).

```
npm install get-chrome-tabs
```

## API

```javascript
const getChromeTabs = require('get-chrome-tabs');
```

### getChromeTabs([*option*])

*option*: `Object`  
Return: `Promise<Array<Object>>`  

*macOS with [JXA](https://github.com/JXA-Cookbook/JXA-Cookbook#readme) support is required.*

Each object included in the resultant array has the following properties:

* windowIndex `integer` – An index of the window which contains the tab (`0` (foremost), `1`, ...)
* windowVisible `boolean` – Whether the window which contains the tab is visible or not
* url `string` – A URL currently opened by the tab
* title `string` – The tab title
* active `boolean` – Whether the tab is currently selected or not. Each window has one active tab.
* loading `boolean` - Whether the tab is loading or not

It will be rejected when Chrome is not running.

### option.app

Type: `string` (either `'canary'` or `'chromium'`)

Instead of Chrome (default), refer to [Chrome Canary](https://www.google.com/chrome/canary/) or [Chromium](https://www.chromium.org/Home).

```javascript
// When Chrome is not running but Chrome Canary is running

(async () => {
  try {
    await getChromeTabs();
  } catch (err) {
    err.message; //=> 'Tried to get tabs of Chrome, but Chrome is currently not running.'
  }

  await getChromeTabs({app: 'canary'}); //=> [{windowIndex: 0, windowVisible: true, ...}, ...]
})();

```

## License

[ISC License](./LICENSE) © 2018 Shinnosuke Watanabe
