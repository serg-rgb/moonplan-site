/* Loads the browser bundle of Astronomy Engine (assets/vendor/astronomy-engine) into Node; returns the Astronomy object. */
const fs = require('node:fs'), path = require('node:path');
module.exports = () => {
  const m = { exports: {} };
  new Function('module', 'exports', fs.readFileSync(path.resolve(__dirname, '../../assets/vendor/astronomy-engine/astronomy.browser.min.js'), 'utf8'))(m, m.exports);
  return m.exports;
};
