#!/usr/bin/env node

// PixConvert API server entry point
// Usage: npx @rushikeshsakharleofficial/fileconverter-new

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run server.js from package root
const serverPath = join(__dirname, '..', 'server.js');
await import(serverPath);
