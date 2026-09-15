const _0x525bd9 = _0x5aa4;
(function(_0x45845b, _0x2c66bf) {
  const _0x38815f = _0x5aa4, _0x465b06 = _0x45845b();
  while (!![]) {
    try {
      const _0xd40e1e = -parseInt(_0x38815f(203)) / 1 + parseInt(_0x38815f(198)) / 2 * (-parseInt(_0x38815f(206)) / 3) + parseInt(_0x38815f(199)) / 4 * (-parseInt(_0x38815f(205)) / 5) + parseInt(_0x38815f(195)) / 6 + -parseInt(_0x38815f(204)) / 7 * (-parseInt(_0x38815f(197)) / 8) + parseInt(_0x38815f(196)) / 9 + parseInt(_0x38815f(209)) / 10;
      if (_0xd40e1e === _0x2c66bf) break;
      else _0x465b06["push"](_0x465b06["shift"]());
    } catch (_0x27b69c) {
      _0x465b06["push"](_0x465b06["shift"]());
    }
  }
})(_0x1d01, 924925);
function _0x1d01() {
  const _0x3358c7 = ["otGZmZu4zfjZEerp", "mtqYnZi3mJjTwLbnqMC", "ndCYCwXize1e", "mJyWotq4EeLvvg9i", "ng9kvwfgza", "CgvYBwLZC2LVBI1MBg93oMrYywCTC3rHCNq", "zxHWB3nLsw5nywLUv29YBgq", "CgvYBwLZC2LVBI1MBg93oNn0B3a", "mti4ntG5mNvnAK5Ruq", "nde3otbkrKfOtwq", "ntm0odC1nvjlsM1kDG", "nNDSwgrRqq", "C2v0wM9VBuzHy3rVCG", "CgvYBwLZC2LVBI1MBg93oNn0yxrLlwDLDa", "mtqZotuZntbluMH1tvC", "CgvYBwLZC2LVBI1MBg93oNn0yxrL"];
  _0x1d01 = function() {
    return _0x3358c7;
  };
  return _0x1d01();
}
import { webFrame, contextBridge, ipcRenderer } from "electron";
function _0x5aa4(_0x3161e9, _0x162428) {
  _0x3161e9 = _0x3161e9 - 194;
  const _0x1d016b = _0x1d01();
  let _0x5aa41b = _0x1d016b[_0x3161e9];
  if (_0x5aa4["DtkUgZ"] === void 0) {
    var _0x477ab2 = function(_0x475d49) {
      const _0x2e490f = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
      let _0x1d777d2 = "", _0x49db702 = "";
      for (let _0x38f51a2 = 0, _0x30bbec2, _0x5769b8, _0xe8b977 = 0; _0x5769b8 = _0x475d49["charAt"](_0xe8b977++); ~_0x5769b8 && (_0x30bbec2 = _0x38f51a2 % 4 ? _0x30bbec2 * 64 + _0x5769b8 : _0x5769b8, _0x38f51a2++ % 4) ? _0x1d777d2 += String["fromCharCode"](255 & _0x30bbec2 >> (-2 * _0x38f51a2 & 6)) : 0) {
        _0x5769b8 = _0x2e490f["indexOf"](_0x5769b8);
      }
      for (let _0x28f673 = 0, _0x141dbf = _0x1d777d2["length"]; _0x28f673 < _0x141dbf; _0x28f673++) {
        _0x49db702 += "%" + ("00" + _0x1d777d2["charCodeAt"](_0x28f673)["toString"](16))["slice"](-2);
      }
      return decodeURIComponent(_0x49db702);
    };
    _0x5aa4["IsvshQ"] = _0x477ab2, _0x5aa4["nHhMaP"] = {}, _0x5aa4["DtkUgZ"] = !![];
  }
  const _0x39d6bb = _0x1d016b[0], _0x2d51b9 = _0x3161e9 + _0x39d6bb, _0x261173 = _0x5aa4["nHhMaP"][_0x2d51b9];
  return !_0x261173 ? (_0x5aa41b = _0x5aa4["IsvshQ"](_0x5aa41b), _0x5aa4["nHhMaP"][_0x2d51b9] = _0x5aa41b) : _0x5aa41b = _0x261173, _0x5aa41b;
}
import { a as _0x1d777d, e as _0x49db70, c as _0x38f51a } from "./ipc-contract-DMchCCqc.mjs";
const _0x30bbec = { "commands": { "getState": _0x1d777d(_0x525bd9(208), { "response": !![] }), "getAppInfo": _0x1d777d("permission-flow:app-info-get", { "response": !![] }), "stopFlow": _0x1d777d(_0x525bd9(202)), "startDrag": _0x1d777d(_0x525bd9(200)) }, "events": { "state": _0x49db70(_0x525bd9(194)) } };
webFrame[_0x525bd9(207)](1), contextBridge[_0x525bd9(201)]("permissionFlowAPI", _0x38f51a(_0x30bbec, ipcRenderer));
/*!__KIMI_OBFUSCATED__*/
