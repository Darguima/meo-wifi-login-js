"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.meoWifiLogoff = exports.meoWifiLogin = exports.encryptPassword = void 0;

var https = _interopRequireWildcard(require("https"));

var CryptoJS = _interopRequireWildcard(require("crypto-js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var meoWifiLogoff = function meoWifiLogoff() {
  // https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Logoff?callback=foo
  return new Promise(function (resolve, reject) {
    var req = https.request({
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
          statusCode: res.statusCode || 0,
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

exports.meoWifiLogoff = meoWifiLogoff;

var encryptPassword = function encryptPassword(password, ip) {
  var iv = CryptoJS.enc.Hex.parse('72c4721ae01ae0e8e84bd64ad66060c4');
  var salt = CryptoJS.enc.Hex.parse('77232469666931323429396D656F3938574946');
  var key = CryptoJS.PBKDF2(ip, salt, {
    keySize: 8,
    iterations: 100
  });
  var crypto = CryptoJS.AES.encrypt(password, key, {
    iv: iv
  });
  return crypto.ciphertext.toString(CryptoJS.enc.Base64);
};

exports.encryptPassword = encryptPassword;

var meoWifiLogin = function meoWifiLogin(username, password, ip) {
  var cryptoPassword = encryptPassword(password, ip); // https://servicoswifi.apps.meo.pt/HotspotConnection.svc/Login?username=${username}&password=${cryptoPassword}&navigatorLang=pt&callback=foo

  return new Promise(function (resolve, reject) {
    var req = https.request({
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
          statusCode: res.statusCode || 0,
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

exports.meoWifiLogin = meoWifiLogin;
