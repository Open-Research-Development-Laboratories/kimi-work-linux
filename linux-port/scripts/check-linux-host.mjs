#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, '..');
const defaultOutput = fs.existsSync(path.join(here, 'chrome-sandbox')) ? here : path.join(project, 'dist', 'kimi-work-linux-x64');
const output = process.env.KIMI_LINUX_OUTPUT || defaultOutput;
const sourceNative = path.resolve(here, '..', 'native', 'linux-host.cjs');
const packagedNative = path.join(here, 'resources', 'app.asar.unpacked', 'out', 'native', 'linux-x64', 'linux-host.cjs');
const nativeModule = fs.existsSync(sourceNative) ? sourceNative : packagedNative;
const { hostReport } = createRequire(import.meta.url)(nativeModule);
const report = hostReport({ releaseRoot: output });
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (process.argv.includes('--strict') && !report.ok) process.exitCode = 78;
