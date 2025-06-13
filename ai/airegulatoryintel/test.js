const airegulatoryintel = require('./airegulatoryintel');

(async () => {
  const result = await airegulatoryintel({
    text: "This smart contract enables cross-border payments using Pi Coin.",
    region: "global",
    provider/index.js

```js
module.exports = {
  // ...other features...
  airegulatoryintel: require('./airegulatoryintel/airegulatoryintel'),
  // ...other features...
};
