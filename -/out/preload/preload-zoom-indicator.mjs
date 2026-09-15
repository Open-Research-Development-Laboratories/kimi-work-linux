function _0x29eb(_0x3b25e5, _0x9772a3) {
  _0x3b25e5 = _0x3b25e5 - 411;
  var _0x52dbfa = _0x52db();
  var _0x29ebff = _0x52dbfa[_0x3b25e5];
  if (_0x29eb["aHwEgK"] === void 0) {
    var _0x24ba23 = function(_0x278982) {
      var _0x125baf = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
      var _0x6104b12 = "", _0x42570e = "";
      for (var _0xa55e99 = 0, _0x587f0a, _0x4c5c0b, _0x6511a = 0; _0x4c5c0b = _0x278982["charAt"](_0x6511a++); ~_0x4c5c0b && (_0x587f0a = _0xa55e99 % 4 ? _0x587f0a * 64 + _0x4c5c0b : _0x4c5c0b, _0xa55e99++ % 4) ? _0x6104b12 += String["fromCharCode"](255 & _0x587f0a >> (-2 * _0xa55e99 & 6)) : 0) {
        _0x4c5c0b = _0x125baf["indexOf"](_0x4c5c0b);
      }
      for (var _0x39fa99 = 0, _0x4b9c16 = _0x6104b12["length"]; _0x39fa99 < _0x4b9c16; _0x39fa99++) {
        _0x42570e += "%" + ("00" + _0x6104b12["charCodeAt"](_0x39fa99)["toString"](16))["slice"](-2);
      }
      return decodeURIComponent(_0x42570e);
    };
    _0x29eb["MhojJD"] = _0x24ba23, _0x29eb["yWdwsZ"] = {}, _0x29eb["aHwEgK"] = !![];
  }
  var _0x32ba58 = _0x52dbfa[0], _0xa829cb = _0x3b25e5 + _0x32ba58, _0x37c2e3 = _0x29eb["yWdwsZ"][_0xa829cb];
  return !_0x37c2e3 ? (_0x29ebff = _0x29eb["MhojJD"](_0x29ebff), _0x29eb["yWdwsZ"][_0xa829cb] = _0x29ebff) : _0x29ebff = _0x37c2e3, _0x29ebff;
}
var _0x50e1ad = _0x29eb;
(function(_0xe70481, _0x5556f4) {
  var _0x151182 = _0x29eb, _0xe580f4 = _0xe70481();
  while (!![]) {
    try {
      var _0x110c72 = parseInt(_0x151182(416)) / 1 + parseInt(_0x151182(414)) / 2 * (parseInt(_0x151182(423)) / 3) + -parseInt(_0x151182(421)) / 4 + parseInt(_0x151182(419)) / 5 + -parseInt(_0x151182(412)) / 6 + -parseInt(_0x151182(415)) / 7 * (parseInt(_0x151182(420)) / 8) + parseInt(_0x151182(411)) / 9 * (parseInt(_0x151182(418)) / 10);
      if (_0x110c72 === _0x5556f4) break;
      else _0xe580f4["push"](_0xe580f4["shift"]());
    } catch (_0x170bb5) {
      _0xe580f4["push"](_0xe580f4["shift"]());
    }
  }
})(_0x52db, 103636);
import { contextBridge, ipcRenderer } from "electron";
import { B as _0x6104b1 } from "./bridge-protocol-DWxPcj8R.mjs";
function _0x52db() {
  var _0x1012f9 = ["mty2ndCYEuv4z3jH", "ndeXmda4Bez1vejc", "wK9ptv9jtKrjq0fut1jFqunusu9o", "mZLLBhfZwg8", "zxHWB3nLsw5nywLUv29YBgq", "mtHdBLfdDhi", "mta3odi5nMXzu1n5Cq", "EM9VBuLUzgLJyxrVCKfqsq", "mtG2nZrprKv1Bwu", "n2PNzxHdAG", "ndq3mZvpCNHTyKW", "wK9ptv9jtKrjq0fut1jFu1rbveu", "ody1odiWtwnwAuzT", "mZm4mty1z2vet3zA"];
  _0x52db = function() {
    return _0x1012f9;
  };
  return _0x52db();
}
contextBridge[_0x50e1ad(424)](_0x50e1ad(413), { "onState"(_0x42570e) {
  var _0xb47056 = _0x50e1ad;
  ipcRenderer["on"](_0x6104b1[_0xb47056(417)], (_0xa55e99, _0x587f0a) => {
    _0x42570e(_0x587f0a);
  });
}, "act"(_0x4c5c0b) {
  var _0x340e03 = _0x50e1ad;
  ipcRenderer["send"](_0x6104b1[_0x340e03(422)], _0x4c5c0b);
} });
/*!__KIMI_OBFUSCATED__*/
