const _0x577eab = _0x43a3;
(function(_0x3905e8, _0x9e1417) {
  const _0xc2c2bc = _0x43a3, _0xe310c6 = _0x3905e8();
  while (!![]) {
    try {
      const _0x11df75 = -parseInt(_0xc2c2bc(457)) / 1 * (parseInt(_0xc2c2bc(443)) / 2) + -parseInt(_0xc2c2bc(460)) / 3 + parseInt(_0xc2c2bc(445)) / 4 + parseInt(_0xc2c2bc(476)) / 5 + -parseInt(_0xc2c2bc(444)) / 6 + -parseInt(_0xc2c2bc(446)) / 7 + parseInt(_0xc2c2bc(491)) / 8;
      if (_0x11df75 === _0x9e1417) break;
      else _0xe310c6["push"](_0xe310c6["shift"]());
    } catch (_0x2a3281) {
      _0xe310c6["push"](_0xe310c6["shift"]());
    }
  }
})(_0xc560, 595415);
import { webFrame, ipcRenderer, contextBridge, clipboard, webUtils } from "electron";
import { d as _0xfbd6e8 } from "./ipc-BQDntDxu.mjs";
import { K as _0xea66b8, s as _0x5ba045 } from "./volcano-track-88gFysUV.mjs";
import { a as _0x2666d6, e as _0xbc8cb4, c as _0x2587b6 } from "./ipc-contract-DMchCCqc.mjs";
function _0x43a3(_0x244b63, _0x592b9a) {
  _0x244b63 = _0x244b63 - 442;
  const _0xc5609b = _0xc560();
  let _0x43a3c3 = _0xc5609b[_0x244b63];
  if (_0x43a3["muLbOU"] === void 0) {
    var _0x524ad4 = function(_0x3b239e) {
      const _0x47c0ae = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
      let _0xfbd6e82 = "", _0xea66b82 = "";
      for (let _0x5ba0452 = 0, _0x2666d62, _0xbc8cb42, _0x2587b62 = 0; _0xbc8cb42 = _0x3b239e["charAt"](_0x2587b62++); ~_0xbc8cb42 && (_0x2666d62 = _0x5ba0452 % 4 ? _0x2666d62 * 64 + _0xbc8cb42 : _0xbc8cb42, _0x5ba0452++ % 4) ? _0xfbd6e82 += String["fromCharCode"](255 & _0x2666d62 >> (-2 * _0x5ba0452 & 6)) : 0) {
        _0xbc8cb42 = _0x47c0ae["indexOf"](_0xbc8cb42);
      }
      for (let _0x533c572 = 0, _0x4cbf4a2 = _0xfbd6e82["length"]; _0x533c572 < _0x4cbf4a2; _0x533c572++) {
        _0xea66b82 += "%" + ("00" + _0xfbd6e82["charCodeAt"](_0x533c572)["toString"](16))["slice"](-2);
      }
      return decodeURIComponent(_0xea66b82);
    };
    _0x43a3["MseyIC"] = _0x524ad4, _0x43a3["oSOYrk"] = {}, _0x43a3["muLbOU"] = !![];
  }
  const _0x3b7215 = _0xc5609b[0], _0x4c7d7d = _0x244b63 + _0x3b7215, _0x18f89d = _0x43a3["oSOYrk"][_0x4c7d7d];
  return !_0x18f89d ? (_0x43a3c3 = _0x43a3["MseyIC"](_0x43a3c3), _0x43a3["oSOYrk"][_0x4c7d7d] = _0x43a3c3) : _0x43a3c3 = _0x18f89d, _0x43a3c3;
}
const _0x533c57 = { "commands": { "hide": _0x2666d6(_0x577eab(499)), "openConversation": _0x2666d6(_0x577eab(496)), "selectFiles": _0x2666d6(_0x577eab(456), { "response": !![] }), "selectFolder": _0x2666d6(_0x577eab(481), { "response": !![] }), "listProjectWorkspaces": _0x2666d6(_0x577eab(462), { "response": !![] }), "getShortcut": _0x2666d6("launcher:get-shortcut", { "response": !![] }), "getPermissionMode": _0x2666d6("launcher:get-permission-mode", { "response": !![] }), "miniMode": _0x2666d6(_0x577eab(480)), "openWorkSettings": _0x2666d6(_0x577eab(461)), "resolveModel": _0x2666d6(_0x577eab(486), { "response": !![] }), "getSubmitTrackContext": _0x2666d6(_0x577eab(484), { "response": !![] }), "recordConversationModel": _0x2666d6(_0x577eab(489)), "recordProjectModel": _0x2666d6("launcher:record-project-model"), "captureCapabilities": _0x2666d6(_0x577eab(495), { "response": !![] }), "captureStart": _0x2666d6(_0x577eab(458)), "captureFreeze": _0x2666d6(_0x577eab(464), { "response": !![] }), "captureSave": _0x2666d6(_0x577eab(470)), "captureDownload": _0x2666d6(_0x577eab(454), { "response": !![] }), "captureExtractText": _0x2666d6(_0x577eab(473), { "response": !![] }), "capturePin": _0x2666d6(_0x577eab(497)), "captureCancel": _0x2666d6(_0x577eab(488)), "scrollCaptureStart": _0x2666d6(_0x577eab(475), { "response": !![] }), "scrollCaptureStop": _0x2666d6(_0x577eab(494)), "scrollCaptureFinish": _0x2666d6(_0x577eab(459), { "response": !![] }), "scrollCaptureAnnotate": _0x2666d6(_0x577eab(472), { "response": !![] }), "scrollCaptureAuto": _0x2666d6("launcher:scroll-capture-auto"), "scrollCaptureAcceptGap": _0x2666d6("launcher:scroll-capture-accept-gap"), "scrollCaptureRegions": _0x2666d6(_0x577eab(490)), "scrollCaptureWheel": _0x2666d6("launcher:scroll-capture-wheel"), "relocateReady": _0x2666d6(_0x577eab(449)) }, "events": { "clear": _0xbc8cb4(_0x577eab(453)), "captureResult": _0xbc8cb4(_0x577eab(466)), "scrollCaptureChunk": _0xbc8cb4(_0x577eab(469)), "scrollCaptureState": _0xbc8cb4("launcher:scroll-capture-state"), "addFiles": _0xbc8cb4("launcher:add-files"), "suggestWorkspace": _0xbc8cb4(_0x577eab(467)), "appearance": _0xbc8cb4(_0x577eab(474)), "willHide": _0xbc8cb4(_0x577eab(471)), "resummon": _0xbc8cb4(_0x577eab(479)), "relocate": _0xbc8cb4(_0x577eab(465)), "willRelocate": _0xbc8cb4(_0x577eab(450)) } };
webFrame[_0x577eab(482)](1);
const _0x4cbf4a = _0x2587b6(_0x533c57, ipcRenderer), _0x558c83 = _0x2587b6(_0xfbd6e8, ipcRenderer), _0x1e55e8 = { "platform": process[_0x577eab(493)], "rpc": async (_0x26c6c2, _0x58df6e) => {
  const _0x1599ed = _0x577eab, _0x6b12fd = { "method": _0x26c6c2, ..._0x58df6e === void 0 ? {} : { "params": _0x58df6e } }, _0x1cb77b = await ipcRenderer["invoke"](_0xea66b8[_0x1599ed(501)], _0x6b12fd);
  if (!_0x1cb77b["ok"]) {
    const _0x1789bf = new Error(_0x1cb77b["error"]?.[_0x1599ed(477)] ?? _0x1599ed(442));
    Object["assign"](_0x1789bf, { "code": _0x1cb77b[_0x1599ed(451)]?.[_0x1599ed(455)], "data": _0x1cb77b["error"]?.[_0x1599ed(468)] });
    throw _0x1789bf;
  }
  return _0x1cb77b[_0x1599ed(447)];
}, ..._0x4cbf4a, "plugins": { "listInstalled": () => ipcRenderer["invoke"](_0xea66b8[_0x577eab(485)], {}) }, "dictation": _0x558c83, "volcanoTrack": (_0x45a3c9, _0x576d9c) => {
  _0x5ba045(_0x45a3c9, _0x576d9c);
}, "saveTempFile": (_0x4640ba, _0x45fd68) => ipcRenderer[_0x577eab(487)](_0xea66b8["SAVE_TEMP_FILE"], { "name": _0x4640ba, "data": _0x45fd68 }), "getPathForFile": async (_0x946e7d) => {
  const _0x1d8bc2 = _0x577eab;
  try {
    const _0x340166 = webUtils["getPathForFile"](_0x946e7d);
    return _0x340166 ? await ipcRenderer[_0x1d8bc2(487)](_0xea66b8[_0x1d8bc2(448)], _0x340166) : "";
  } catch {
    return "";
  }
}, "statPath": (_0xdf141b) => ipcRenderer[_0x577eab(487)](_0xea66b8[_0x577eab(500)], { "path": _0xdf141b }), "detectImageContent": (_0x323761, _0x20dfe1, _0x9332ed) => ipcRenderer[_0x577eab(487)](_0xea66b8[_0x577eab(492)], { "path": _0x323761, "name": _0x20dfe1, "displayName": _0x9332ed }), "createAttachmentPreviewUrl": (_0x9ec139) => ipcRenderer[_0x577eab(487)](_0xea66b8[_0x577eab(498)], { "path": _0x9ec139 }), "readClipboardImage": () => {
  const _0x521e4d = _0x577eab, _0x131fb7 = clipboard["readImage"]();
  if (_0x131fb7["isEmpty"]()) return null;
  return { "data": new Uint8Array(_0x131fb7[_0x521e4d(483)]()), "mimeType": _0x521e4d(478) };
} };
function _0xc560() {
  const _0x54b506 = ["Bgf1BMnOzxi6y2fWDhvYzs1JyxbHyMLSAxrPzxm", "Bgf1BMnOzxi6B3bLBI1JB252zxjZyxrPB24", "Bgf1BMnOzxi6y2fWDhvYzs1WAw4", "q1jfqvrfx0fuvefdse1ftLrFufjfvKLfv19vuKW", "Bgf1BMnOzxi6AgLKzq", "u1rbvf9qqvri", "uLbd", "uLbdigzHAwXLza", "mJiXntiWnfDbB053rG", "mtiWodKZngrYwMnetW", "nZyYndeYs3H1rvPT", "nZG0mJa3mMTNCeXQAW", "CMvZDwX0", "vfjvu1rFv0vcx0zjtevFuefusa", "Bgf1BMnOzxi6CMvSB2nHDguTCMvHzhK", "Bgf1BMnOzxi6D2LSBc1YzwXVy2f0zq", "zxjYB3i", "Bgf1BMnOzxjbueK", "Bgf1BMnOzxi6y2XLyxi", "Bgf1BMnOzxi6y2fWDhvYzs1KB3DUBg9Hza", "y29Kzq", "Bgf1BMnOzxi6C2vSzwn0lwzPBgvZ", "muf3tMjSCa", "Bgf1BMnOzxi6y2fWDhvYzs1ZDgfYDa", "Bgf1BMnOzxi6C2nYB2XSlwnHChr1CMuTzMLUAxnO", "nZK2nZC5z2DdvvjN", "Bgf1BMnOzxi6B3bLBI13B3jRlxnLDhrPBMDZ", "Bgf1BMnOzxi6ChjVAMvJDc13B3jRC3bHy2vZ", "zxHWB3nLsw5nywLUv29YBgq", "Bgf1BMnOzxi6y2fWDhvYzs1MCMvLEMu", "Bgf1BMnOzxi6CMvSB2nHDgu", "Bgf1BMnOzxi6y2fWDhvYzs1Yzxn1Bhq", "Bgf1BMnOzxi6C3vNz2vZDc13B3jRC3bHy2u", "zgf0yq", "Bgf1BMnOzxi6C2nYB2XSlwnHChr1CMuTy2H1BMS", "Bgf1BMnOzxi6y2fWDhvYzs1ZyxzL", "Bgf1BMnOzxi6D2LSBc1OAwrL", "Bgf1BMnOzxi6C2nYB2XSlwnHChr1CMuTyw5UB3rHDgu", "Bgf1BMnOzxi6y2fWDhvYzs1LEhrYywn0lxrLEhq", "Bgf1BMnOzxi6yxbWzwfYyw5Jzq", "Bgf1BMnOzxi6C2nYB2XSlwnHChr1CMuTC3rHCNq", "mtK0nZCZnvfOtvHMqG", "BwvZC2fNzq", "Aw1Hz2uVCg5N", "Bgf1BMnOzxi6CMvZDw1TB24", "Bgf1BMnOzxi6BwLUAs1TB2rL", "Bgf1BMnOzxi6C2vSzwn0lwzVBgrLCG", "C2v0wM9VBuzHy3rVCG", "Dg9qtKC", "Bgf1BMnOzxi6z2v0lxn1yM1PDc10CMfJAY1JB250zxH0", "ueXvr0Lox01buKTfvf9msvnux0Lou1rbteXfra", "Bgf1BMnOzxi6CMvZB2X2zs1TB2rLBa", "Aw52B2TL", "Bgf1BMnOzxi6y2fWDhvYzs1Jyw5JzwW", "Bgf1BMnOzxi6CMvJB3jKlwnVBNzLCNnHDgLVBI1TB2rLBa", "Bgf1BMnOzxi6C2nYB2XSlwnHChr1CMuTCMvNAw9UCW", "mJe2ode5nJbOtvjpEee", "revurunux0LnquDfx0nptLrftLq", "CgXHDgzVCM0", "Bgf1BMnOzxi6C2nYB2XSlwnHChr1CMuTC3rVCa"];
  _0xc560 = function() {
    return _0x54b506;
  };
  return _0xc560();
}
contextBridge[_0x577eab(463)](_0x577eab(452), _0x1e55e8);
/*!__KIMI_OBFUSCATED__*/
