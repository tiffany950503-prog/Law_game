#!/usr/bin/env python3
"""Build index.html from src/. Usage: python3 build.py"""
import json, pathlib
R = pathlib.Path(__file__).parent / 'src'
css = (R / 'base.css').read_text() + '\n' + (R / 'extra.css').read_text()
scenes = json.dumps(json.loads((R / 'scenes.json').read_text()), ensure_ascii=False)
order = ['util.js', 'audio.js', 'evimg.js', 'engine.js', 'profile.js',
         'cases/murder.js', 'cases/dui.js', 'cases/affair.js', 'cases/land.js', 'cases/kidnap.js', 'cases/bribe.js',
         'main.js']
js = '\n'.join((R / f).read_text() for f in order)
html = (R / 'template.html').read_text()
html = html.replace('/*{{CSS}}*/', css).replace('/*{{SCENES}}*/', scenes).replace('/*{{JS}}*/', js)
out = pathlib.Path(__file__).parent / 'index.html'
out.write_text(html)
print(out, len(html.encode()), 'bytes')

# Full standalone document for GitHub Pages (served from /docs)
page = ('<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        + html.replace('<style>', '<style>\n[hidden]{display:none!important}', 1)
              .replace('<div id="phone">', '</head>\n<body>\n<div id="phone">', 1)
        + '</body>\n</html>\n')
docs = pathlib.Path(__file__).parent / 'docs'
docs.mkdir(exist_ok=True)
(docs / 'index.html').write_text(page)
(docs / '.nojekyll').write_text('')
print(docs / 'index.html', len(page.encode()), 'bytes')
