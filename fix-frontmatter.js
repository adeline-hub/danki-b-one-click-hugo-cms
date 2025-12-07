const fs = require('fs');
const path = require('path');
const glob = require('glob');

const POSTS_DIR = path.join(__dirname, 'site/content/post');

// Récupère tous les index.md
const files = glob.sync(`${POSTS_DIR}/**/index.md`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);

  if (!match) {
    console.warn(`Creating front matter for ${file}`);
    const fmString = `---
title: "Untitled"
date: "${new Date().toISOString()}"
draft: false
---
`;
    fs.writeFileSync(file, fmString + content, 'utf8');
    return;
  }

  let [_, fm, body] = match;
  const lines = fm.split('\n').map(l => l.trim());
  let newFm = {};
  let tags = [];

  lines.forEach(line => {
    if (!line) return;

    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) {
      let [, key, value] = kv;

      // Corrige la date
      if (key === 'date') {
        const d = new Date(value);
        if (!isNaN(d)) value = d.toISOString();
      }

      // Échappe tous les caractères problématiques pour YAML
      if (['title', 'description'].includes(key)) {
        value = value.replace(/"/g, '\\"');   // échappe les guillemets
        if (value.includes(':') || value.includes('#') || value.includes('\n')) {
          // si multi-lignes, utiliser le block scalar YAML `|` ou `>`
          if (key === 'description') {
            value = `>\n  ${value.replace(/\n/g, '\n  ')}`;
          } else {
            value = `"${value}"`;
          }
        }
      }

      newFm[key] = value;
    } else if (line.startsWith('#')) {
      const lineTags = line.split(' ').map(t => t.replace('#','').trim()).filter(Boolean);
      tags.push(...lineTags);
    }
  });

  if (!('draft' in newFm)) newFm['draft'] = false;
  if (tags.length) newFm['tags'] = tags;

  let fmString = '---\n';
  Object.entries(newFm).forEach(([k, v]) => {
    if (k === 'description' && v.startsWith('>')) {
      fmString += `description: ${v}\n`;
    } else if (k === 'tags') {
      fmString += `tags:\n`;
      v.forEach(tag => fmString += `  - ${tag}\n`);
    } else {
      fmString += `${k}: ${v}\n`;
    }
  });
  fmString += '---\n\n';

  const newContent = fmString + body.trimStart();
  fs.writeFileSync(file, newContent, 'utf8');
  console.log(`Fixed front matter for ${file}`);
});

