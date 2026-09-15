/*
 * build-artifact.js — produce dist/artifact.html, the same page in the form the
 * Claude Artifact publisher expects: page content only, no <html>/<head>/<body>
 * wrapper, with <title> first. Supporting files (css/, js/, vendor/) are
 * published alongside it unchanged.
 *
 *   node tools/build-artifact.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const title = (src.match(/<title>([\s\S]*?)<\/title>/) || [, 'Muscular Atlas 3D'])[1];
const head = src.slice(src.indexOf('<head>'), src.indexOf('</head>'));
const links = (head.match(/<link[^>]*>/g) || []).join('\n');
const body = src.slice(src.indexOf('<body>') + 6, src.lastIndexOf('</body>')).trim();

const out = `<title>${title}</title>\n${links}\n\n${body}\n`;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'artifact.html'), out);
console.log('dist/artifact.html', out.length, 'bytes');
