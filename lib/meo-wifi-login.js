"use strict";

var _https = _interopRequireDefault(require("https"));

var _cryptoJs = _interopRequireDefault(require("crypto-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var meoWifiLogoff = function meoWifiLogoff() {
  // https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Logoff?callback=foo
  return new Promise(function (resolve, reject) {
    var req = _https["default"].request({
      host: 'servicoswifi.apps.meo.pt',
      path: '/HotspotConnection.svc/Logoff?callback=foo',
      port: 443,
      method: 'GET',
      headers: {
        'user-agent': 'node.js'
      }
    }, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (body) {
        var response = JSON.parse(body.substring(0, body.length - 2).replace('foo(', ''));
        resolve({
          success: response,
          statusCode: res.statusCode,
          url: "https://".concat(req.host).concat(req.path)
        });
      });
    });

    req.on('error', function (e) {
      return reject(e);
    });
    req.end();
  });
};

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

var meoWifiLogin = function meoWifiLogin(username, password, ip) {
  var cryptoPassword = encryptPassword(password, ip); // https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=${username}&password=${cryptoPassword}&navigatorLang=pt&callback=foo

  return new Promise(function (resolve, reject) {
    var req = _https["default"].request({
      host: 'servicoswifi.apps.meo.pt',
      path: "/HotspotConnection.svc/Login?username=".concat(encodeURIComponent(username), "&password=").concat(encodeURIComponent(cryptoPassword), "&navigatorLang=pt&callback=foo"),
      port: 443,
      method: 'GET',
      headers: {
        'user-agent': 'node.js'
      }
    }, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (body) {
        var response = JSON.parse(body.substring(0, body.length - 2).replace('foo(', ''));
        resolve({
          success: response.result,
          response: response,
          statusCode: res.statusCode,
          url: "https://".concat(req.host).concat(req.path),
          cryptoPassword: cryptoPassword
        });
      });
    });

    req.on('error', function (e) {
      return reject(e);
    });
    req.end();
  });
};

meoWifiLogin('dsgdevbraga@gmail.com', 'password', '10.23.24.25').then(function (r) {
  return console.log(JSON.stringify(r, null, 2));
});
meoWifiLogoff().then(function (r) {
  return console.log(JSON.stringify(r, null, 2));
});
