"use strict";

var _cryptoJs = _interopRequireDefault(require("crypto-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// https://cryptojs.gitbook.io/docs/#ciphers
var encryptPassword = function encryptPassword(password, ip) {
  var iv = _cryptoJs["default"].enc.Hex.parse('72c4721ae01ae0e8e84bd64ad66060c4');

  var salt = _cryptoJs["default"].enc.Hex.parse('77232469666931323429396D656F3938574946');

  var key = _cryptoJs["default"].PBKDF2(ip, salt, {
    keySize: 8,
    iterations: 100
  });

  var crypto = _cryptoJs["default"].AES.encrypt(password, key, {
    iv: iv
  });

  return crypto.ciphertext.toString(_cryptoJs["default"].enc.Base64);
};

var password = encryptPassword('password', '10.23.24.25');
console.log(password);
