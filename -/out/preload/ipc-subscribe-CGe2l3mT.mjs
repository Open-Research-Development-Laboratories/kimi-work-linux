(function(_0x17ae05, _0x2b2f82) {
  const _0x12a47 = _0x3bf1, _0x56c921 = _0x17ae05();
  while (!![]) {
    try {
      const _0x4c50db = -parseInt(_0x12a47(400)) / 1 * (-parseInt(_0x12a47(389)) / 2) + parseInt(_0x12a47(390)) / 3 * (-parseInt(_0x12a47(392)) / 4) + -parseInt(_0x12a47(394)) / 5 + parseInt(_0x12a47(397)) / 6 + -parseInt(_0x12a47(391)) / 7 + parseInt(_0x12a47(399)) / 8 + -parseInt(_0x12a47(395)) / 9;
      if (_0x4c50db === _0x2b2f82) break;
      else _0x56c921["push"](_0x56c921["shift"]());
    } catch (_0xd20782) {
      _0x56c921["push"](_0x56c921["shift"]());
    }
  }
})(_0x5912, 601774);
function _0x5912() {
  const _0x1b9a5b = ["mJrsCgXPshm", "y2fSBgjHy2TZ", "mJaXmdCXmhjlCerxEa", "mZq0mdyXz3rqwMrK", "z2v0", "mtGZndeZnfbdtgnKDa", "ywrK", "otq2ntKZnNbJsfrwCa", "mJLAsgrXtxe", "C2L6zq", "mJqWotjjs0XYA00", "mti2nte5qK9eswfV", "mZGWmtu3nhvsCw5rvq"];
  _0x5912 = function() {
    return _0x1b9a5b;
  };
  return _0x5912();
}
import { ipcRenderer } from "electron";
const _0x54072f = /* @__PURE__ */ new Map();
function _0x3bf1(_0x723576, _0x2d196e) {
  _0x723576 = _0x723576 - 388;
  const _0x591223 = _0x5912();
  let _0x3bf1cf = _0x591223[_0x723576];
  if (_0x3bf1["ucKLQi"] === void 0) {
    var _0x34c104 = function(_0x2ec34d) {
      const _0x28016b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
      let _0x54072f2 = "", _0x13ce9a2 = "";
      for (let _0x2ada3b = 0, _0x13f4da, _0x5c029f, _0x55584a = 0; _0x5c029f = _0x2ec34d["charAt"](_0x55584a++); ~_0x5c029f && (_0x13f4da = _0x2ada3b % 4 ? _0x13f4da * 64 + _0x5c029f : _0x5c029f, _0x2ada3b++ % 4) ? _0x54072f2 += String["fromCharCode"](255 & _0x13f4da >> (-2 * _0x2ada3b & 6)) : 0) {
        _0x5c029f = _0x28016b["indexOf"](_0x5c029f);
      }
      for (let _0x198812 = 0, _0x508529 = _0x54072f2["length"]; _0x198812 < _0x508529; _0x198812++) {
        _0x13ce9a2 += "%" + ("00" + _0x54072f2["charCodeAt"](_0x198812)["toString"](16))["slice"](-2);
      }
      return decodeURIComponent(_0x13ce9a2);
    };
    _0x3bf1["KTnFdx"] = _0x34c104, _0x3bf1["pPSleu"] = {}, _0x3bf1["ucKLQi"] = !![];
  }
  const _0x4cf647 = _0x591223[0], _0x1d3616 = _0x723576 + _0x4cf647, _0xdc405f = _0x3bf1["pPSleu"][_0x1d3616];
  return !_0xdc405f ? (_0x3bf1cf = _0x3bf1["KTnFdx"](_0x3bf1cf), _0x3bf1["pPSleu"][_0x1d3616] = _0x3bf1cf) : _0x3bf1cf = _0xdc405f, _0x3bf1cf;
}
function _0x13ce9a(_0x2ada3b, _0x13f4da) {
  const _0x25697a = _0x3bf1, _0x5c029f = _0x13f4da;
  let _0x55584a = _0x54072f["get"](_0x2ada3b);
  if (!_0x55584a) {
    const _0x198812 = /* @__PURE__ */ new Set(), _0x508529 = (_0x4e9679, ..._0x499658) => {
      for (const _0x73ae84 of [..._0x198812]) {
        _0x73ae84(..._0x499658);
      }
    };
    ipcRenderer["on"](_0x2ada3b, _0x508529), _0x55584a = { "callbacks": _0x198812, "handler": _0x508529 }, _0x54072f["set"](_0x2ada3b, _0x55584a);
  }
  return _0x55584a["callbacks"][_0x25697a(398)](_0x5c029f), () => {
    const _0x1ac838 = _0x25697a, _0x4c5b41 = _0x54072f[_0x1ac838(396)](_0x2ada3b);
    if (!_0x4c5b41) return;
    _0x4c5b41[_0x1ac838(393)]["delete"](_0x5c029f), _0x4c5b41[_0x1ac838(393)][_0x1ac838(388)] === 0 && (ipcRenderer["removeListener"](_0x2ada3b, _0x4c5b41["handler"]), _0x54072f["delete"](_0x2ada3b));
  };
}
/*!__KIMI_OBFUSCATED__*/
export {
  _0x13ce9a as s
};
