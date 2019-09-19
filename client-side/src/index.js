import _ from 'lodash';
const bip39 = require('bip39');

function component() {
  const element = document.createElement('div');

  const mnemonic = bip39.entropyToMnemonic('00000000000000000000000000000000');
  element.innerHTML = _.join(['Mnemonic', mnemonic], ' ');

  return element;
}


document.body.appendChild(component());
