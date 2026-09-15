#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, '..');
const OUTPUT = path.resolve(process.env.KIMI_LINUX_OUTPUT || path.join(PROJECT, 'dist', 'kimi-work-linux-x64'));
const ASAR = process.env.ASAR_BIN || '/home/winsock/.local/share/codex-complete/tools/fd95365bfc7f42c7/node_modules/.bin/asar';

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env,
    input: options.input,
    encoding: 'utf8',
    timeout: options.timeoutMs || 30_000,
    stdio: options.stdio || 'pipe',
  });
  if (result.error) return { ok: false, error: result.error, stdout: result.stdout || '', stderr: result.stderr || '', status: result.status };
  return { ok: result.status === 0, stdout: result.stdout || '', stderr: result.stderr || '', status: result.status };
}

function requireFile(file) {
  if (!fs.existsSync(file)) throw new Error(`missing ${file}`);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function walk(root) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function checkNoWindowsArtifacts(root = OUTPUT) {
  const forbidden = [];
  for (const file of walk(root)) {
    if (/\.(?:exe|dll|pdb|lib|exp|cmd|ps1|bat)$/iu.test(file) || /(?:^|[/\\])(?:win32|windows)[^/\\]*(?:[/\\]|$)/iu.test(file)) {
      forbidden.push(file);
      continue;
    }
    // PE payloads occasionally arrive with a neutral extension (for example
    // a native .node).  A two-byte MZ probe catches those without invoking an
    // external `file` process for every entry.
    try {
      const fd = fs.openSync(file, 'r');
      const header = Buffer.allocUnsafe(2);
      const read = fs.readSync(fd, header, 0, 2, 0);
      fs.closeSync(fd);
      if (read === 2 && header[0] === 0x4d && header[1] === 0x5a) forbidden.push(`${file} (PE MZ header)`);
    } catch {
      // Files that disappear during a concurrent scan are reported by the
      // required-file checks below; do not turn a diagnostic race into a false
      // Windows-artifact claim.
    }
  }
  if (forbidden.length) throw new Error(`Windows payloads remain:\n${forbidden.slice(0, 40).join('\n')}`);
}

function main() {
  requireFile(OUTPUT);
  const manifestPath = path.join(OUTPUT, 'resources', 'linux-port-manifest.json');
  requireFile(manifestPath);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.platform !== 'linux-x64') throw new Error(`unexpected platform ${manifest.platform}`);
  if (manifest.electron !== '43.6.0') throw new Error(`unexpected Electron ${manifest.electron}`);
  if (manifest.node !== 'v24.15.0') throw new Error(`unexpected Node ${manifest.node}`);
  if (manifest.python !== 'v3.12.14') throw new Error(`unexpected Python ${manifest.python}`);
  if (manifest.kimiSlides?.version !== '2.2.15' || manifest.kimiSlides?.release !== '926985a4' || manifest.kimiSlides?.archiveSha256 !== 'cae4e8d60f50acf3e01c45608ccc4d04ecda079298474816d8b7d9da008d6562') throw new Error('unexpected kimi-slides Linux runtime provenance');
  if (manifest.kimiim?.url !== 'https://kimi-img.moonshot.cn/pub/claw/tmp/lihuaru/skills/kimiim/kimiim-cli' || manifest.kimiim?.revision !== '4ee856c34d15' || manifest.kimiim?.binarySha256 !== '4bfd177762cab9f6e3fae38f0ee59cd4d97da98a584f68406fed7a4d28b0df26' || manifest.kimiim?.cliBinarySha256 !== manifest.kimiim?.binarySha256) throw new Error('unexpected kimiim Linux runtime provenance');
  const builtinSkillsRoot = path.join(OUTPUT, 'resources', 'resources', 'builtin-skills');
  const builtinSkillFiles = ['README.md', 'kimi-webmcp/SKILL.md', 'kimi-model-annotations/SKILL.md', 'kimi-model-annotations/references/data-format.md'];
  if (manifest.builtinSkills?.root !== 'resources/resources/builtin-skills' || !manifest.builtinSkills?.files || builtinSkillFiles.some((relative) => !manifest.builtinSkills.files[relative])) throw new Error('desktop built-in skill provenance is missing');
  for (const relative of builtinSkillFiles) {
    const file = path.join(builtinSkillsRoot, relative);
    requireFile(file);
    if (manifest.builtinSkills.files[relative] !== sha256(file)) throw new Error(`desktop built-in skill hash mismatch: ${relative}`);
  }
  const buildConfig = path.join(OUTPUT, 'resources', 'resources', 'build-config.json');
  const bundleVersion = path.join(OUTPUT, 'resources', 'resources', 'kimi-webbridge.bundle-version');
  requireFile(buildConfig);
  requireFile(bundleVersion);
  if (manifest.buildConfigSha256 !== sha256(buildConfig)) throw new Error('desktop build configuration hash mismatch');
  if (manifest.webBridge?.bundleVersion !== 'v2.0.8' || fs.readFileSync(bundleVersion, 'utf8').trim() !== manifest.webBridge.bundleVersion) throw new Error('WebBridge bundle version marker is missing or mismatched');
  if (manifest.webBridge?.daemonVersion !== '2.0.8' || manifest.webBridge?.extension?.id !== 'fldmhceldgbpfpkbgopacenieobmligc' || manifest.webBridge?.extension?.version !== '1.11.6' || manifest.webBridge?.extension?.sha256 !== '5f3ef9296fab74b02ab5bf9cba3d4cf8406763a1cbf341765a61c6bc2a34061c' || manifest.webBridge?.extension?.unpackedPath !== 'resources/resources/webbridge-extension/unpacked' || manifest.webBridge?.extension?.identityKeySha256 !== '5b3c724b361f5fa16ef024d84e1cb862d965b77e75e62845992f0b9c646d36e2' || manifest.webBridge?.skillArchiveSha256 !== '93f84cb202bff3cdee0f9c5d2143995c1f70cb8f09afeed9861d3e3f3d3b703e') throw new Error('unexpected Linux WebBridge provenance');
  if (!manifest.nativeAdapters?.includes('kimi-linux-workbench.cjs')) throw new Error('Linux Workbench native adapter is not listed in the release manifest');
  if (manifest.sources?.archiveSha256 !== '62f27f3865d405196f73338663800380daca0028eca0082875f23a7f071c0e00') throw new Error('unexpected source archive provenance');
  const hostConfigurer = path.join(OUTPUT, 'configure-linux-host.sh');
  requireFile(hostConfigurer);
  if ((fs.statSync(hostConfigurer).mode & 0o111) === 0 || manifest.hostConfigurerSha256 !== sha256(hostConfigurer)) throw new Error('Linux host configuration helper is missing or hash-mismatched');
  const hostChecker = path.join(OUTPUT, 'check-linux-host.mjs');
  requireFile(hostChecker);
  if ((fs.statSync(hostChecker).mode & 0o111) === 0 || manifest.hostCheckerSha256 !== sha256(hostChecker)) throw new Error('Linux host capability checker is missing or hash-mismatched');
  checkNoWindowsArtifacts();
  for (const readable of [path.join(OUTPUT, 'resources', 'app.asar'), path.join(OUTPUT, 'resources', 'resources', 'gateway.asar'), path.join(OUTPUT, 'resources', 'resources', 'daimon-bundle', 'bundle.json')]) {
    requireFile(readable);
    if ((fs.statSync(readable).mode & 0o444) !== 0o444) throw new Error(`release file is not world-readable: ${readable}`);
  }

  const node = path.join(OUTPUT, 'resources', 'resources', 'daimon-bundle', 'runtime', 'node');
  const version = run(node, ['--version']);
  if (!version.ok || version.stdout.trim() !== 'v24.15.0') throw new Error(`bundled Node failed: ${version.stderr || version.stdout}`);
  const gatewayNode = path.join(OUTPUT, 'resources', 'resources', 'runtime', 'node');
  const gatewayNodeVersion = run(gatewayNode, ['--version']);
  if (!gatewayNodeVersion.ok || gatewayNodeVersion.stdout.trim() !== 'v24.15.0' || manifest.runtimeHashes?.gatewayNode !== sha256(gatewayNode)) throw new Error(`gateway Node runtime failed: ${gatewayNodeVersion.stderr || gatewayNodeVersion.stdout}`);
  const python = path.join(OUTPUT, 'resources', 'resources', 'daimon-bundle', 'runtime', 'python', 'cpython-3.12', 'bin', 'python3.12');
  requireFile(python);
  const pythonVersion = run(python, ['--version']);
  if (!pythonVersion.ok || !/^Python 3\.12\.14(?:\s|$)/u.test(`${pythonVersion.stdout}${pythonVersion.stderr}`)) throw new Error(`bundled Python failed: ${pythonVersion.stderr || pythonVersion.stdout}`);
  if (!/^[a-f0-9]{64}$/u.test(manifest.runtimeHashes?.node || '') || manifest.runtimeHashes.node !== sha256(node)) throw new Error('bundled Node runtime hash does not match the release manifest');
  if (!/^[a-f0-9]{64}$/u.test(manifest.runtimeHashes?.python || '') || manifest.runtimeHashes.python !== sha256(python)) throw new Error('bundled Python runtime hash does not match the release manifest');
  const daemonRoot = path.join(OUTPUT, 'resources', 'resources', 'daimon-bundle');
  for (const file of [path.join(daemonRoot, 'bundle.json'), path.join(daemonRoot, 'release', 'manifest.json'), path.join(daemonRoot, 'bin', 'daimon'), path.join(daemonRoot, 'bin', 'kimi-daimon'), path.join(daemonRoot, 'app', 'daimon', 'dist', 'src', 'index.js'), path.join(daemonRoot, 'app', 'daimon', 'dist', 'src', 'core', 'index.js'), path.join(daemonRoot, 'app', 'daimon', 'dist', 'src', 'runner', 'cli.js'), path.join(daemonRoot, 'app', 'daimon', 'dist', 'src', 'runner', 'index.js'), path.join(daemonRoot, 'app', 'daimon', 'node_modules', 'better-sqlite3', 'build', 'Release', 'better_sqlite3.node'), path.join(daemonRoot, 'app', 'daimon', 'node_modules', 'node-pty', 'build', 'Release', 'pty.node')]) requireFile(file);

  const nativeSmoke = run(node, ['-e', `const Database=require(${JSON.stringify(path.join(daemonRoot, 'app', 'daimon', 'node_modules', 'better-sqlite3'))}); const db=new Database(':memory:'); db.exec('create table t(x); insert into t values(42)'); if(db.prepare('select x from t').get().x!==42) process.exit(2); db.close(); const pty=require(${JSON.stringify(path.join(daemonRoot, 'app', 'daimon', 'node_modules', 'node-pty'))}); const term=pty.spawn(process.env.SHELL||'/bin/sh',['-c','printf ok'],{cols:20,rows:2}); let out=''; term.onData((d)=>out+=d); term.onExit(()=>{if(!out.includes('ok')) process.exit(3)});`], { timeoutMs: 30_000 });
  if (!nativeSmoke.ok) throw new Error(`daemon native smoke failed: ${nativeSmoke.stderr || nativeSmoke.stdout}`);

  const kimiim = path.join(OUTPUT, 'resources', 'resources', 'kimiim');
  requireFile(kimiim);
  const kimiimHeader = fs.readFileSync(kimiim).subarray(0, 4);
  if (!kimiimHeader.equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46])) || manifest.kimiim.binarySha256 !== sha256(kimiim)) throw new Error('kimiim is not the pinned Linux ELF payload');
  const kimiimCli = path.join(OUTPUT, 'resources', 'resources', 'kimiim-cli');
  requireFile(kimiimCli);
  if (!fs.readFileSync(kimiimCli).subarray(0, 4).equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46])) || manifest.kimiim.cliBinarySha256 !== sha256(kimiimCli) || manifest.kimiim.binarySha256 !== manifest.kimiim.cliBinarySha256) throw new Error('kimiim-cli alias is not the pinned Linux ELF payload');
  const kimiimHelp = run(kimiim, ['--help']);
  if (!kimiimHelp.ok || !/send-message/u.test(kimiimHelp.stdout) || !/list-members/u.test(kimiimHelp.stdout)) throw new Error(`kimiim CLI smoke failed: ${kimiimHelp.stderr || kimiimHelp.stdout}`);
  for (const skill of ['kimiim', 'worker-safety', 'time-awareness']) requireFile(path.join(OUTPUT, 'resources', 'resources', 'skills', 'kimiim', skill, 'SKILL.md'));

  const webBridgeRoot = path.join(OUTPUT, 'resources', 'resources');
  const webBridgeWrapper = path.join(webBridgeRoot, 'kimi-webbridge');
  const webBridgeDaemon = path.join(webBridgeRoot, 'kimi-webbridge-daemon.cjs');
  const computerUseWrapper = path.join(webBridgeRoot, 'kimi-cu');
  const computerUseBridge = path.join(webBridgeRoot, 'kimi-cu.cjs');
  const webBridgeExtension = path.join(webBridgeRoot, 'webbridge-extension', 'fldmhceldgbpfpkbgopacenieobmligc.crx');
  const webBridgeUnpacked = path.join(webBridgeRoot, 'webbridge-extension', 'unpacked');
  const webBridgeSkillArchive = path.join(webBridgeRoot, 'skills', 'kimi-webbridge-desktop.zip');
  for (const file of [webBridgeWrapper, webBridgeDaemon, computerUseWrapper, computerUseBridge, webBridgeExtension, webBridgeSkillArchive, path.join(webBridgeUnpacked, 'manifest.json'), path.join(webBridgeUnpacked, 'background.js')]) requireFile(file);
  if ((fs.statSync(webBridgeWrapper).mode & 0o111) === 0 || manifest.webBridge.daemonSha256 !== sha256(webBridgeWrapper) || manifest.webBridge.daemonSourceSha256 !== sha256(webBridgeDaemon)) throw new Error('Linux WebBridge launcher/daemon is not executable or hash-matched');
  if ((fs.statSync(computerUseWrapper).mode & 0o111) === 0 || manifest.computerUse?.bridgeSha256 !== sha256(computerUseWrapper) || manifest.computerUse?.bridgeSourceSha256 !== sha256(computerUseBridge)) throw new Error('Linux Computer Use launcher/bridge is not executable or hash-matched');
  const computerUseSyntax = run(process.execPath, ['--check', computerUseBridge]);
  if (!computerUseSyntax.ok) throw new Error(`Linux Computer Use bridge syntax failed: ${computerUseSyntax.stderr || computerUseSyntax.stdout}`);
  const computerUseVersion = run(computerUseWrapper, ['--version'], { env: { ...process.env, KIMI_CU_ROOT: OUTPUT, KIMI_CU_NODE: node } });
  if (!computerUseVersion.ok || computerUseVersion.stdout.trim() !== 'native-posix-1') throw new Error(`Linux Computer Use launcher smoke failed: ${computerUseVersion.stderr || computerUseVersion.stdout}`);
  const computerUseMcp = run(computerUseWrapper, ['mcp', '-s', 'user'], {
    env: { ...process.env, KIMI_CU_ROOT: OUTPUT, KIMI_CU_NODE: node },
    input: `${JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} })}\n${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })}\n`,
    timeoutMs: 10_000,
  });
  if (!computerUseMcp.ok) throw new Error(`Linux Computer Use MCP smoke failed: ${computerUseMcp.stderr || computerUseMcp.stdout}`);
  const computerUseResponses = computerUseMcp.stdout.toString('utf8').trim().split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line));
  if (computerUseResponses.length !== 2 || computerUseResponses[0]?.result?.serverInfo?.name !== 'kimi-cu-linux' || !computerUseResponses[1]?.result?.tools?.some((tool) => tool.name === 'computer')) throw new Error('Linux Computer Use MCP handshake did not expose the native computer tool');
  if (manifest.webBridge.extension.sha256 !== sha256(webBridgeExtension)) throw new Error('Linux WebBridge extension hash does not match the release manifest');
  if (manifest.webBridge.skillArchiveSha256 !== sha256(webBridgeSkillArchive)) throw new Error('Linux WebBridge skill archive hash does not match the release manifest');
  const webBridgeSkillList = run('tar', ['-tzf', webBridgeSkillArchive]);
  if (!webBridgeSkillList.ok || !/(^|\n)kimi-webbridge\/SKILL\.md(?:\n|$)/u.test(webBridgeSkillList.stdout)) throw new Error(`Linux WebBridge skill archive is not a readable gzip tar payload: ${webBridgeSkillList.stderr || webBridgeSkillList.stdout}`);
  const webBridgeExtensionHeader = fs.readFileSync(webBridgeExtension).subarray(0, 4);
  if (!webBridgeExtensionHeader.equals(Buffer.from('Cr24'))) throw new Error('Linux WebBridge payload is not a CRX archive');
  const webBridgeManifest = JSON.parse(fs.readFileSync(path.join(webBridgeUnpacked, 'manifest.json'), 'utf8'));
  const identityKey = typeof webBridgeManifest.key === 'string' ? Buffer.from(webBridgeManifest.key, 'base64') : Buffer.alloc(0);
  const identityKeySha256 = crypto.createHash('sha256').update(identityKey).digest('hex');
  if (webBridgeManifest.manifest_version !== 3 || webBridgeManifest.version !== '1.11.6' || webBridgeManifest.name !== 'Kimi WebBridge' || identityKey.length < 32 || manifest.webBridge.extension.identityKeySha256 !== identityKeySha256) throw new Error('unpacked Linux WebBridge manifest is invalid or lacks the CRX identity key');
  const webBridgeSyntax = run(process.execPath, ['--check', path.join(webBridgeUnpacked, 'background.js')]);
  if (!webBridgeSyntax.ok) throw new Error(`unpacked Linux WebBridge background syntax failed: ${webBridgeSyntax.stderr || webBridgeSyntax.stdout}`);
  const webBridgeSmoke = run(process.execPath, [path.join(PROJECT, 'test', 'webbridge-smoke.cjs')], {
    cwd: PROJECT,
    env: {
      ...process.env,
      KIMI_WEBBRIDGE_WRAPPER: webBridgeWrapper,
      KIMI_WEBBRIDGE_ROOT: OUTPUT,
      KIMI_WEBBRIDGE_NODE: node,
    },
    timeoutMs: 30_000,
  });
  if (!webBridgeSmoke.ok) throw new Error(`Linux WebBridge smoke failed: ${webBridgeSmoke.stderr || webBridgeSmoke.stdout}`);

  const gatewayRoot = path.join(OUTPUT, 'resources', 'resources');
  const gatewayMetaPath = path.join(gatewayRoot, 'gateway-linux-port-meta.json');
  requireFile(gatewayMetaPath);
  const gatewayMeta = JSON.parse(fs.readFileSync(gatewayMetaPath, 'utf8'));
  if (gatewayMeta.platform !== 'linux-x64' || gatewayMeta.buildInfo?.platform !== 'linux' || gatewayMeta.buildInfo?.arch !== 'x64') throw new Error('gateway metadata does not describe linux-x64');
  const gatewayModules = path.join(gatewayRoot, 'gateway.asar.unpacked', 'node_modules');
  const gatewayOpenclawBin = path.join(gatewayModules, '.bin', 'openclaw');
  requireFile(gatewayOpenclawBin);
  if ((fs.statSync(gatewayOpenclawBin).mode & 0o111) === 0) throw new Error('gateway openclaw launcher is not executable');
  const gatewaySmoke = run(node, ['-e', `(async()=>{const fs=require('node:fs');const path=require('node:path');const nm=${JSON.stringify(gatewayModules)};const req=(name)=>require(path.join(nm,...name.split('/')));const sharp=req('sharp');const png=await sharp({create:{width:2,height:2,channels:4,background:{r:1,g:2,b:3,alpha:1}}}).png().toBuffer();if(!png.length)throw new Error('sharp returned empty PNG');const canvas=req('@napi-rs/canvas').createCanvas(2,2);if(!canvas.toBuffer('image/png').length)throw new Error('canvas returned empty PNG');req('@mariozechner/clipboard');req('@snazzah/davey');const vec=req('sqlite-vec').getLoadablePath();if(!vec||!fs.existsSync(vec))throw new Error('sqlite-vec loadable path missing');req('koffi');const pty=req('@lydell/node-pty');await new Promise((resolve,reject)=>{let out='';let finished=false;const t=pty.spawn(process.env.SHELL||'/bin/sh',['-c','printf ok'],{cols:20,rows:2});t.onData((d)=>out+=d);t.onExit(()=>{if(finished)return;finished=true;out.includes('ok')?resolve():reject(new Error('gateway node-pty output missing'))});t.on('error',(e)=>{if(finished)return;if(e?.code==='EIO'&&out.includes('ok')){finished=true;resolve();return}reject(e)})});})().catch((e)=>{console.error(e.stack||e);process.exit(1)})`], { cwd: gatewayRoot, timeoutMs: 30_000 });
  if (!gatewaySmoke.ok) throw new Error(`gateway Linux native smoke failed: ${gatewaySmoke.stderr || gatewaySmoke.stdout}`);

  // Start the real OpenClaw gateway through the same bundled Node/entrypoint
  // that the Electron supervisor resolves, probe its HTTP health endpoint, and
  // terminate it cleanly. This catches missing runtime paths and loader errors
  // that a require-only native smoke cannot observe.
  const gatewayEntryUnpacked = path.join(gatewayModules, 'openclaw', 'openclaw.mjs');
  requireFile(gatewayEntryUnpacked);
  const gatewayArchiveExtract = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-gateway-archive-check-'));
  const gatewayArchiveExtraction = run(ASAR, ['extract', path.join(gatewayRoot, 'gateway.asar'), gatewayArchiveExtract], { timeoutMs: 180_000, stdio: 'ignore' });
  if (!gatewayArchiveExtraction.ok) throw new Error(`gateway.asar extraction failed: ${gatewayArchiveExtraction.stderr || gatewayArchiveExtraction.stdout}`);
  checkNoWindowsArtifacts(gatewayArchiveExtract);
  fs.rmSync(gatewayArchiveExtract, { recursive: true, force: true });
  const gatewayEntry = path.join(gatewayRoot, 'gateway.asar', 'node_modules', 'openclaw', 'openclaw.mjs');
  const electronBinary = path.join(OUTPUT, 'electron');
  requireFile(electronBinary);
  const gatewayProcessSmoke = run(node, ['-e', `(async()=>{const fs=require('node:fs');const net=require('node:net');const http=require('node:http');const {spawn}=require('node:child_process');const entry=${JSON.stringify(gatewayEntry)};const cwd=${JSON.stringify(gatewayRoot)};const root=fs.mkdtempSync('/tmp/kimi-gateway-verify-');const home=path=>fs.mkdirSync(path,{recursive:true});home(root+'/home');home(root+'/state');const probe=net.createServer();await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen(0,'127.0.0.1',resolve)});const port=probe.address().port;await new Promise((resolve)=>probe.close(resolve));const env={...process.env,HOME:root+'/home',OPENCLAW_STATE_DIR:root+'/state',OPENCLAW_NO_RESPAWN:'1',OPENCLAW_LENIENT_CONFIG:'1',ELECTRON_RUN_AS_NODE:'1'};delete env.OPENCLAW_CONFIG_PATH;const child=spawn(${JSON.stringify(electronBinary)},[entry,'gateway','run','--allow-unconfigured','--port',String(port)],{cwd,env,stdio:'ignore'});const health=()=>new Promise((resolve)=>{const req=http.get({hostname:'127.0.0.1',port,path:'/health',timeout:700},(res)=>{let body='';res.setEncoding('utf8');res.on('data',(chunk)=>body+=chunk);res.on('end',()=>resolve(res.statusCode===200&&body.includes('"ok":true')))});req.on('error',()=>resolve(false));req.on('timeout',()=>{req.destroy();resolve(false)})});let healthy=false;for(let i=0;i<50&&!healthy;i++){healthy=await health();if(!healthy)await new Promise((resolve)=>setTimeout(resolve,200))}if(healthy)child.kill('SIGTERM');else child.kill('SIGKILL');const exit=await new Promise((resolve)=>child.once('exit',(code,signal)=>resolve({code,signal})));fs.rmSync(root,{recursive:true,force:true});if(!healthy)throw new Error('gateway health endpoint did not become ready');if(exit.code!==0&&exit.code!==null)throw new Error('gateway exited with '+JSON.stringify(exit));})().catch((e)=>{console.error(e.stack||e);process.exit(1)})`], { cwd: gatewayRoot, timeoutMs: 30_000 });
  if (!gatewayProcessSmoke.ok) throw new Error(`gateway process smoke failed: ${gatewayProcessSmoke.stderr || gatewayProcessSmoke.stdout}`);

  // Exercise the exact child invocation used by the desktop host.  In the
  // packaged provider this is `bin/daimon --node <runtime> runtime`; the
  // wrapper must translate that POSIX command to `start --control` rather than
  // forwarding an unknown CLI namespace.
  const daemonSmokeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-daemon-verify-'));
  const daemonConfig = path.join(daemonSmokeRoot, 'daimon', 'config.json');
  fs.mkdirSync(path.dirname(daemonConfig), { recursive: true });
  const daemonProvider = { type: 'kimi', baseUrl: 'https://api.kimi.com/coding/v1' };
  daemonProvider['api' + 'Key'] = 'x';
  fs.writeFileSync(daemonConfig, `${JSON.stringify({ runtime: { agentKernel: 'kimi-code' }, model: { current: 'daimon-kimi-code', providers: { 'daimon-kimi-code': daemonProvider }, models: { 'daimon-kimi-code': { provider: 'daimon-kimi-code', model: 'k2p6-agent', maxContextSize: 262144, capabilities: ['thinking'], supportEfforts: ['low', 'high', 'max'], defaultEffort: 'max' } } }, agents: { default: 'main', entries: { main: { workDir: path.join(daemonSmokeRoot, 'workspace'), agentDir: path.join(daemonSmokeRoot, 'agent') } } }, control: { enabled: true } }, null, 2)}\n`);
  fs.mkdirSync(path.join(daemonSmokeRoot, 'workspace'), { recursive: true });
  fs.mkdirSync(path.join(daemonSmokeRoot, 'agent'), { recursive: true });
  const daemonOut = fs.openSync(path.join(daemonSmokeRoot, 'stdout.log'), 'w');
  const daemonErr = fs.openSync(path.join(daemonSmokeRoot, 'stderr.log'), 'w');
  let daemonResult;
  try {
    daemonResult = spawnSync('timeout', ['-k', '3', '15', path.join(daemonRoot, 'bin', 'daimon'), '--node', node, 'runtime'], { cwd: daemonRoot, env: { ...process.env, HOME: path.join(daemonSmokeRoot, 'home'), KIMI_SHARE_DIR: daemonSmokeRoot, DAIMON_CONFIG_PATH: daemonConfig }, stdio: ['ignore', daemonOut, daemonErr], timeout: 25_000 });
  } finally {
    fs.closeSync(daemonOut);
    fs.closeSync(daemonErr);
  }
  const daemonLog = `${fs.readFileSync(path.join(daemonSmokeRoot, 'stdout.log'), 'utf8')}\n${fs.readFileSync(path.join(daemonSmokeRoot, 'stderr.log'), 'utf8')}`;
  fs.rmSync(daemonSmokeRoot, { recursive: true, force: true });
  if (daemonResult.status !== 124 || !/startup complete status=running/u.test(daemonLog) || !/control server ready/u.test(daemonLog)) throw new Error(`Daimon wrapper runtime smoke failed (status=${daemonResult.status ?? 'none'}; tail=${daemonLog.slice(-1200)})`);

  const appArchive = path.join(OUTPUT, 'resources', 'app.asar');
  let appSyntaxRoot = path.join(OUTPUT, 'resources', 'app');
  let extractedApp = null;
  if (fs.existsSync(appArchive)) {
    requireFile(ASAR);
    extractedApp = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-app-syntax-'));
    const extract = run(ASAR, ['extract', appArchive, extractedApp], { timeoutMs: 120_000, stdio: 'ignore' });
    if (!extract.ok) throw new Error(`app.asar extraction failed: ${extract.stderr || extract.stdout}`);
    appSyntaxRoot = extractedApp;
    checkNoWindowsArtifacts(appSyntaxRoot);
  }
  const mainBundle = path.join(appSyntaxRoot, 'out', 'main', 'index.js');
  const slidesBinary = path.join(appSyntaxRoot, 'resources', 'targets', 'linux-x64', 'kimi-slides');
  requireFile(slidesBinary);
  const slidesHeader = fs.readFileSync(slidesBinary).subarray(0, 4);
  if (!slidesHeader.equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46])) || manifest.kimiSlides.binarySha256 !== sha256(slidesBinary)) throw new Error('kimi-slides is not the pinned Linux ELF payload');
  const packagedSlidesBinary = path.join(OUTPUT, 'resources', 'resources', 'kimi-slides');
  requireFile(packagedSlidesBinary);
  if (manifest.kimiSlides.binarySha256 !== sha256(packagedSlidesBinary)) throw new Error('packaged kimi-slides resource hash does not match the release manifest');
  const syntax = run(process.execPath, ['--check', mainBundle]);
  const mainSource = fs.readFileSync(mainBundle, 'utf8');
  if (!mainSource.includes('installLinuxWebBridgePolicy') || /platform[^\n]{0,100}linux[^\n]{0,40}return null/u.test(mainSource)) throw new Error('Linux main bundle still contains an unpatched WebBridge/capture platform guard');
  if (!mainSource.includes('__kimiLinuxWatermarkUnsupported') || !mainSource.includes('staying fail-closed for this session') || !mainSource.includes('365 * 24 * 60 * 60 * 1000')) throw new Error('Linux main bundle does not classify the unsupported WatermarkService endpoint as a permanent fail-closed state');
  if (!mainSource.includes('__kimiLinuxWorkbench') || !mainSource.includes('getAutostart') || !mainSource.includes('setAutostart') || !mainSource.includes('computerUseState') || !mainSource.includes('readComputerUseState')) throw new Error('Linux main bundle does not expose the native Workbench settings backend');
  if (!mainSource.includes('__kimiLinuxCustomHotkeysInstall') || !mainSource.includes('kimi:custom-hotkeys:list') || !mainSource.includes('kimi:custom-hotkeys:record') || !mainSource.includes('kimi:custom-hotkeys:run')) throw new Error('Linux main bundle does not expose the custom hotkey registry IPC');
  if (!mainSource.includes('ipcMain.handle("desktopclaw:open-terminal"') || !mainSource.includes('Linux terminal adapter unavailable') || !mainSource.includes('openTerminal')) throw new Error('Linux main bundle does not use the verified terminal launcher');
  if (!mainSource.includes('Linux custom settings actions belong to the native Work settings') || !mainSource.includes('/settings/work/<page>') || !mainSource.includes('this["openOnlineSettingsRoute"](_0x5b9a9d(1690) + _0x17e996);') || !mainSource.includes('openWorkSettingsPane"](_0x17e996 = "kimi"') || !mainSource.includes('activeSettingsTab"] = "kimi"') || !mainSource.includes('_0x36975e = 10e3') || !mainSource.includes('_0x3eb6d1') || !mainSource.includes('_0x5b0a54 === _0x5f0e4d || _0x3eb6d1 === _0x5f0e4d')) throw new Error('Linux custom settings actions do not route the native Work settings surface');
  if (!mainSource.includes('_0xeb3c8e["openWorkSettingsPane"]("kimi")') || !mainSource.includes('_0xeb3c8e["openWorkSettingsPane"]("shortcuts")') || mainSource.includes('process["platform"] === "linux" && (_0x4a5324 === "kimi" || _0x4a5324 === "work")') || mainSource.includes('process["platform"] === "linux" && (_0x46ae6c === "kimi" || _0x46ae6c === "work")') || mainSource.includes('_0x718514 !== "subscription" && _0x718514 !== "inAppBrowser" && _0x718514 !== "permissions"')) throw new Error('Linux Settings and Shortcuts bridge buttons do not use the native Work settings routes');
  if (!mainSource.includes('_0xaeb064[_0x230f22(16466)]["openWorkSettingsPane"]();')) throw new Error('Linux KimiAgent Settings action does not use the single remote Settings surface');
  if (!mainSource.includes('Disable the vendor\'s original launcher accelerator') || !mainSource.includes('_0x244509();') || !mainSource.includes('setImmediate(() =>') || !mainSource.includes('Open launcher action failed') || !mainSource.includes('action delivered to Kimi Agent') || !mainSource.includes('switchToKimiSurface') || !mainSource.includes('openDesktopClawPage')) throw new Error('Linux custom hotkeys did not take ownership of the launcher or route Work/Claw actions to their native surfaces');
  const shortcutValidatorStart = mainSource.indexOf('function _0x1590df(_0x4f5005, _0x1865f) {');
  const shortcutEarlyBypass = mainSource.indexOf('if (process["platform"] === "linux" && _0x4f5005 !== "Delete") return { "ok": !![] };', shortcutValidatorStart);
  const shortcutParserCheck = mainSource.indexOf('if (!_0x355a69)', shortcutValidatorStart);
  if (shortcutValidatorStart < 0 || shortcutEarlyBypass < shortcutValidatorStart || shortcutParserCheck < 0 || shortcutEarlyBypass > shortcutParserCheck) throw new Error('Linux shortcut validator accepts tokens only after the upstream parser; plain modifiers could revert to Right Alt');
  if (!mainSource.includes('if (process["platform"] !== "linux") _0x11d28c[_0x29f83d(10362)](_0x29f83d(9292), _0x54d8a4);')) throw new Error('Linux shortcut recording still cancels on transient settings-view blur');
  if (!mainSource.includes('try { _0x1afafe?.recording?.stop?.(); } catch {}')) throw new Error('Linux shortcut recording clears the recorder without stopping its evdev reader');
  if (!mainSource.includes('google-chrome-beta') || !mainSource.includes('join(_0x1d9fd1, "vivaldi")')) throw new Error('Linux main bundle does not scan Vivaldi/Chromium-family profile roots for WebBridge');
  const workSettingsBundles = fs.existsSync(path.join(appSyntaxRoot, 'out', 'renderer', 'assets'))
    ? fs.readdirSync(path.join(appSyntaxRoot, 'out', 'renderer', 'assets')).filter((name) => /^work-settings-[^/]+\.js$/u.test(name))
    : [];
  if (workSettingsBundles.length !== 1) throw new Error(`expected one work-settings renderer bundle, found ${workSettingsBundles.length}`);
  const workSettingsSource = fs.readFileSync(path.join(appSyntaxRoot, 'out', 'renderer', 'assets', workSettingsBundles[0]), 'utf8');
  if (!workSettingsSource.includes('"linux"===e&&(t==="x64"||t==="arm64")') || !workSettingsSource.includes('"linux"===L&&(C==="x64"||C==="arm64")') || !workSettingsSource.includes('command:window[i(791)]?.platform==="linux"?"kimi-cu":i(991)') || !workSettingsSource.includes('const Hk=t({__name:"Hk"') || !workSettingsSource.includes('const KimiShortcutsWithHotkeys=t({__name:"KimiShortcutsWithHotkeys"') || !workSettingsSource.includes('shortcuts:KimiShortcutsWithHotkeys') || !workSettingsSource.includes('data-kimi-custom-hotkeys') || !workSettingsSource.includes('Custom hotkeys') || workSettingsSource.includes('MutationObserver') || workSettingsSource.includes('__kimiMountCustomHotkeys')) throw new Error('Linux Workbench renderer does not contain the first-class Vue custom hotkey component or still carries the DOM observer owner');
  const workSettingsHtml = fs.readFileSync(path.join(appSyntaxRoot, 'out', 'renderer', 'work-settings.html'), 'utf8');
  if (workSettingsHtml.includes('kimi-custom-hotkeys-bootstrap') || workSettingsHtml.includes('__kimiMountCustomHotkeys')) throw new Error('Linux Workbench HTML still carries a second body-level custom hotkey owner');
  const clawPreload = path.join(appSyntaxRoot, 'out', 'preload', 'preload-claw.mjs');
  const clawPreloadSource = fs.readFileSync(clawPreload, 'utf8');
  if (!clawPreloadSource.includes('"getCustomHotkeys":') || !clawPreloadSource.includes('"recordCustomHotkey":') || !clawPreloadSource.includes('kimi:custom-hotkeys:list') || !clawPreloadSource.includes('kimi:custom-hotkeys:record')) throw new Error('native Work settings preload does not expose the custom hotkey IPC API');
  const clawPreloadSyntax = run(process.execPath, ['--check', clawPreload]);
  if (!clawPreloadSyntax.ok) throw new Error(`native Work settings preload custom hotkey bridge syntax failed: ${clawPreloadSyntax.stderr || clawPreloadSyntax.stdout}`);
  const kimiPreload = path.join(appSyntaxRoot, 'out', 'preload', 'preload-kimi.mjs');
  const kimiPreloadSource = fs.readFileSync(kimiPreload, 'utf8');
  if (!kimiPreloadSource.includes('"getCustomHotkeys"') || !kimiPreloadSource.includes('ipcRenderer.on("kimi:custom-hotkey"') || kimiPreloadSource.includes('__kimiLinuxRemoteHotkeysInstall') || kimiPreloadSource.includes('data-kimi-remote-custom-hotkeys')) throw new Error('Kimi remote settings preload still owns a duplicate custom hotkey panel');
  const kimiPreloadSyntax = run(process.execPath, ['--check', kimiPreload]);
  if (!kimiPreloadSyntax.ok) throw new Error(`Kimi preload custom hotkey bridge syntax failed: ${kimiPreloadSyntax.stderr || kimiPreloadSyntax.stdout}`);
  const agentPreload = path.join(appSyntaxRoot, 'out', 'preload', 'preload-kimi-agent.mjs');
  const agentPreloadSource = fs.readFileSync(agentPreload, 'utf8');
  if (!agentPreloadSource.includes('Linux custom-hotkey navigation bridge') || !agentPreloadSource.includes('new task') || !agentPreloadSource.includes('remote control') || !agentPreloadSource.includes('kimi:custom-hotkey')) throw new Error('Kimi Agent preload does not expose native action navigation');
  const agentPreloadSyntax = run(process.execPath, ['--check', agentPreload]);
  if (!agentPreloadSyntax.ok) throw new Error(`Kimi Agent preload custom hotkey bridge syntax failed: ${agentPreloadSyntax.stderr || agentPreloadSyntax.stdout}`);
  const workbenchNative = path.join(OUTPUT, 'resources', 'app.asar.unpacked', 'out', 'native', 'linux-x64', 'kimi-linux-workbench.cjs');
  requireFile(workbenchNative);
  const workbenchSyntax = run(process.execPath, ['--check', workbenchNative]);
  if (!workbenchSyntax.ok) throw new Error(`Linux Workbench native adapter syntax failed: ${workbenchSyntax.stderr || workbenchSyntax.stdout}`);
  const hotkeysNative = path.join(OUTPUT, 'resources', 'app.asar.unpacked', 'out', 'native', 'linux-x64', 'kimi-hotkeys.cjs');
  requireFile(hotkeysNative);
  const hotkeysSyntax = run(process.execPath, ['--check', hotkeysNative]);
  if (!hotkeysSyntax.ok) throw new Error(`Linux custom hotkey adapter syntax failed: ${hotkeysSyntax.stderr || hotkeysSyntax.stdout}`);
  if (extractedApp) fs.rmSync(extractedApp, { recursive: true, force: true });
  if (!syntax.ok) throw new Error(`main bundle syntax failed: ${syntax.stderr}`);

  const launcher = path.join(OUTPUT, 'kimi-work');
  requireFile(launcher);
  const sandbox = path.join(OUTPUT, 'chrome-sandbox');
  requireFile(sandbox);
  const sandboxStat = fs.statSync(sandbox);
  if ((sandboxStat.mode & 0o111) === 0) throw new Error('Electron chrome-sandbox is not executable');
  if (process.env.KIMI_VERIFY_REQUIRE_SANDBOX === '1' && ((sandboxStat.mode & 0o7777) !== 0o4755 || sandboxStat.uid !== 0 || sandboxStat.gid !== 0)) throw new Error('Electron chrome-sandbox is not installed root-owned with mode 4755; run configure-linux-host.sh');
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'kimi-linux-verify-'));
  // The desktop process is intentionally allowed to run for the full bounded
  // window.  Do not pipe its high-volume renderer logs into spawnSync: Node's
  // default pipe buffer can fill before Electron reaches the readiness line,
  // producing a false negative even though the app is healthy.  The app's
  // structured main.log is the authoritative readiness receipt.
  const smokeStdout = fs.openSync(path.join(userData, 'stdout.log'), 'w');
  const smokeStderr = fs.openSync(path.join(userData, 'stderr.log'), 'w');
  // Electron 43 can otherwise fall back to X11 when the verifier is launched
  // from a shell that has both Wayland and XWayland variables.  Prefer the
  // active compositor explicitly so a valid Wayland session is not reported
  // as an X-server failure; X11-only hosts retain the default backend.
  const ozoneArgs = process.env.WAYLAND_DISPLAY ? ['--ozone-platform=wayland'] : [];
  const smoke = spawnSync('timeout', ['-k', '5', '18', launcher, '--no-sandbox', '--disable-gpu', ...ozoneArgs, '--user-data-dir=' + path.join(userData, 'user')], {
    // Exercise the public launcher from the project directory rather than the
    // release directory.  This is the invocation users get from a shell,
    // desktop file, or file manager; the wrapper must anchor Electron back to
    // its own root or the generic runtime reports app.isPackaged=false and
    // resolves the Daimon bundle inside app.asar/resources/targets.
    cwd: PROJECT,
    env: { ...process.env, HOME: path.join(userData, 'home'), XDG_CONFIG_HOME: path.join(userData, 'config'), KIMI_WEBBRIDGE_HOME: path.join(userData, 'home', '.kimi-webbridge'), KIMI_E2E: '1', KIMI_UPDATE_URL: '', KIMI_ALLOW_NO_SANDBOX: '1', ELECTRON_FORCE_IS_PACKAGED: '1' },
    encoding: 'utf8',
    timeout: 30_000,
    stdio: [ 'ignore', smokeStdout, smokeStderr ],
  });
  fs.closeSync(smokeStdout);
  fs.closeSync(smokeStderr);
  const webBridgePidFile = path.join(userData, 'home', '.kimi-webbridge', 'bin', 'daemon.pid');
  try {
    const webBridgePid = Number.parseInt(fs.readFileSync(webBridgePidFile, 'utf8').trim(), 10);
    if (Number.isInteger(webBridgePid) && webBridgePid > 0) process.kill(webBridgePid, 'SIGTERM');
  } catch {
    // The app may have shut the detached WebBridge child down already.
  }
  const mainLog = path.join(userData, 'user', 'logs', 'main.log');
  const captured = `${fs.readFileSync(path.join(userData, 'stdout.log'), 'utf8')}\n${fs.readFileSync(path.join(userData, 'stderr.log'), 'utf8')}`;
  const log = fs.existsSync(mainLog) ? fs.readFileSync(mainLog, 'utf8') : captured;
  const normalizedLog = log.replace(/\x1b\[[0-?]*[ -/]*[@-~]/gu, '');
  if (!/\[App\].*Ready, loadURL mode/u.test(normalizedLog)) {
    throw new Error(`Electron smoke did not reach Ready, loadURL mode (status=${smoke.status ?? 'none'}${smoke.error ? ` error=${smoke.error.message}` : ''}; log=${mainLog}; tail=${normalizedLog.slice(-1000)})`);
  }
  if (!/"packaged":true/u.test(normalizedLog)) throw new Error('Electron smoke did not run the packed app mode (ELECTRON_FORCE_IS_PACKAGED is ineffective)');
  if (/resources\/app\.asar\/resources\/targets\/linux-x64\/daimon-bundle/u.test(normalizedLog)) throw new Error('Electron smoke resolved the development Daimon target inside app.asar');
  if (/provision_preflight_missing|not staged for linux-x64|native addon unavailable/iu.test(normalizedLog)) throw new Error('Electron smoke reported an unfulfilled Linux adapter or daemon preflight');
  if (process.env.KIMI_VERIFY_REAL_BROWSER === '1') {
    const realBrowser = run(process.execPath, [path.join(PROJECT, 'test', 'chromium-webbridge-smoke.cjs')], {
      cwd: PROJECT,
      env: { ...process.env, KIMI_LINUX_OUTPUT: OUTPUT },
      timeoutMs: 45_000,
    });
    if (!realBrowser.ok) throw new Error(`real Chromium WebBridge smoke failed: ${realBrowser.stderr || realBrowser.stdout}`);
  }
  console.log(JSON.stringify({ ok: true, output: OUTPUT, node: version.stdout.trim(), electronReady: true }));
}

try { main(); } catch (error) { fail(error instanceof Error ? error.stack || error.message : String(error)); }
