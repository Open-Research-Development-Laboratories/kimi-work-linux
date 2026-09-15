function _0x19f3() {
  const _0x13f10e = ["y2fWDhvYzs1WAw46CMvZAxPL", "y2fWDhvYzs1WAw46Bw92zq", "mtq0ndqZn0fJsvPVEa", "y2fWDhvYzvbPBKfqsq", "mtiZodGWohrpAeH1rW", "y2fWDhvYzs1WAw46EM9VBq", "zxHWB3nLsw5nywLUv29YBgq", "mtfqChzeyMq", "mtC4mJu4sfjuBevn", "mJi3nZqWquD2AhbV", "mZvID2PqAwe", "ndHAD3HVC1O", "y2fWDhvYzs1WAw46y2XVC2u", "mJmXotaYnJbfrKDHzNG", "ndq5ntCYohDXsKrqDW", "C2v0wM9VBuzHy3rVCG", "nhz5rKPWzW", "y2fWDhvYzs1WAw46z2v0lwLTywDL", "mZC5nJG3zhDfs2v2"];
  _0x19f3 = function() {
    return _0x13f10e;
  };
  return _0x19f3();
}
function _0x1950(_0x1a504a, _0x23a916) {
  _0x1a504a = _0x1a504a - 370;
  const _0x19f38c = _0x19f3();
  let _0x19500f = _0x19f38c[_0x1a504a];
  if (_0x1950["JZAVcs"] === void 0) {
    var _0x48b27f = function(_0x3aec90) {
      const _0x2fa04c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
      let _0xbad4f12 = "", _0x341f1f2 = "";
      for (let _0x35177c2 = 0, _0xe83a342, _0x3fecb72, _0x16db27 = 0; _0x3fecb72 = _0x3aec90["charAt"](_0x16db27++); ~_0x3fecb72 && (_0xe83a342 = _0x35177c2 % 4 ? _0xe83a342 * 64 + _0x3fecb72 : _0x3fecb72, _0x35177c2++ % 4) ? _0xbad4f12 += String["fromCharCode"](255 & _0xe83a342 >> (-2 * _0x35177c2 & 6)) : 0) {
        _0x3fecb72 = _0x2fa04c["indexOf"](_0x3fecb72);
      }
      for (let _0x14c2c1 = 0, _0x107fd5 = _0xbad4f12["length"]; _0x14c2c1 < _0x107fd5; _0x14c2c1++) {
        _0x341f1f2 += "%" + ("00" + _0xbad4f12["charCodeAt"](_0x14c2c1)["toString"](16))["slice"](-2);
      }
      return decodeURIComponent(_0x341f1f2);
    };
    _0x1950["xfreMu"] = _0x48b27f, _0x1950["Nhhcht"] = {}, _0x1950["JZAVcs"] = !![];
  }
  const _0x2eed5a = _0x19f38c[0], _0x276f6d = _0x1a504a + _0x2eed5a, _0x1d40f8 = _0x1950["Nhhcht"][_0x276f6d];
  return !_0x1d40f8 ? (_0x19500f = _0x1950["xfreMu"](_0x19500f), _0x1950["Nhhcht"][_0x276f6d] = _0x19500f) : _0x19500f = _0x1d40f8, _0x19500f;
}
const _0x17921c = _0x1950;
(function(_0x5294b7, _0x5000f1) {
  const _0x338beb = _0x1950, _0x579596 = _0x5294b7();
  while (!![]) {
    try {
      const _0x20cd76 = parseInt(_0x338beb(372)) / 1 * (-parseInt(_0x338beb(383)) / 2) + -parseInt(_0x338beb(379)) / 3 + -parseInt(_0x338beb(384)) / 4 * (parseInt(_0x338beb(385)) / 5) + parseInt(_0x338beb(386)) / 6 * (-parseInt(_0x338beb(374)) / 7) + -parseInt(_0x338beb(370)) / 8 + parseInt(_0x338beb(377)) / 9 + parseInt(_0x338beb(388)) / 10 * (parseInt(_0x338beb(382)) / 11);
      if (_0x20cd76 === _0x5000f1) break;
      else _0x579596["push"](_0x579596["shift"]());
    } catch (_0x2432fd) {
      _0x579596["push"](_0x579596["shift"]());
    }
  }
})(_0x19f3, 315628);
import { webFrame, ipcRenderer, contextBridge } from "electron";
import { a as _0xbad4f1, e as _0x341f1f, c as _0x35177c } from "./ipc-contract-DMchCCqc.mjs";
const _0xe83a34 = { "commands": { "getImage": _0xbad4f1(_0x17921c(373), { "response": !![] }), "raise": _0xbad4f1("capture-pin:raise"), "move": _0xbad4f1(_0x17921c(376)), "resize": _0xbad4f1(_0x17921c(375)), "zoom": _0xbad4f1(_0x17921c(380)), "close": _0xbad4f1(_0x17921c(387)) }, "events": { "toast": _0x341f1f("capture-pin:toast") } };
webFrame[_0x17921c(371)](1);
const _0x3fecb7 = _0x35177c(_0xe83a34, ipcRenderer);
contextBridge[_0x17921c(381)](_0x17921c(378), _0x3fecb7);
/*!__KIMI_OBFUSCATED__*/
