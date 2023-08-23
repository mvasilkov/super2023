#!/usr/bin/env python3
from itertools import chain, permutations
from pathlib import Path
import sys

from PIL import Image

OUR_ROOT = Path(__file__).resolve().parent

OUT_DIR = OUR_ROOT / 'typescript' / 'pictures'

FILE_LICENSE = '''
/** This file is part of Super Holy Chalice.
 * https://github.com/mvasilkov/super2023
 * @license GPLv3 | Copyright (c) 2023 Mark Vasilkov
 */
'use strict'
'''.strip()

OUT_FILE = f'''
{FILE_LICENSE}

export const value = %s
export const width = %d
export const height = %d
export const cardinality = %d
export const palette = %s
'''.lstrip()

BUILD_DIR = OUR_ROOT / 'build'

HTML_LINK_CSS = '<link rel=stylesheet href=./app.css>'
HTML_INLINE_CSS = '<style>%s</style>'
HTML_LINK_JS = '<script type=module src=./app.js></script>'
HTML_INLINE_JS = '<script>%s</script>'


def get_color(png: Image, x: int, y: int) -> tuple[int, int, int] | None:
    r, g, b, a = png.getpixel((x, y))
    if a == 0:
        return None
    if a == 255:
        return (r, g, b)
    raise ValueError('1-bit alpha please')


def crop_to_content(picture, width: int, height: int) -> tuple[int, int]:
    pixels_per_column = [0] * width
    pixels_per_line = [0] * height

    for y, line in enumerate(picture):
        for x, color in enumerate(line):
            if color is not None:
                pixels_per_column[x] += 1
                pixels_per_line[y] += 1

    left = 0
    while pixels_per_column[left] == 0:
        left += 1

    top = 0
    while pixels_per_line[top] == 0:
        top += 1

    right = width - 1
    while pixels_per_column[right] == 0:
        right -= 1

    bottom = height - 1
    while pixels_per_line[bottom] == 0:
        bottom -= 1

    picture[:] = picture[top : bottom + 1]
    for line in picture:
        line[:] = line[left : right + 1]

    return (right - left + 1, bottom - top + 1)


def palette_sort_key(color: tuple[int, int, int] | None):
    return (0 if color is None else 1, color)


def line_to_int(line, cardinality: int) -> int:
    result = 0
    for color in reversed(line):
        result = result * cardinality + color
    return result


def picture_to_int(picture, width: int, cardinality: int) -> int:
    result = 0
    stride = cardinality**width
    for line in reversed(picture):
        result = result * stride + line_to_int(line, cardinality)
    return result


def js_literal(value: int) -> str:
    a = f'{value}n'
    b = f'0x{value:x}n'
    return a if len(a) < len(b) else b


def js_color(color: tuple[int, int, int] | None) -> str:
    if color is None:
        return ''
    r, g, b = color
    return f'0x{r:02x}{g:02x}{b:02x}'


def js_palette(palette: list[tuple[int, int, int] | None]) -> str:
    result = list(
        chain(
            '[',
            (f'  {js_color(color)},' for color in palette),
            ']',
        )
    )
    return '\n'.join(result)


def build_pictures():
    for png_file in (OUR_ROOT / 'pictures').glob('*.png'):
        print(png_file.name)
        png = Image.open(png_file)
        width, height = png.size

        picture = []
        palette = set()
        for y in range(height):
            picture.append(line := [])
            for x in range(width):
                line.append(color := get_color(png, x, y))
                palette.add(color)

        width, height = crop_to_content(picture, width, height)
        palette = set(color for line in picture for color in line)

        cardinality = len(palette)
        print(f'  {width} by {height}, {cardinality} colors')

        short_literal = None
        short_pal = None
        for pal in permutations(sorted(palette, key=palette_sort_key)):
            pal_obj = {color: index for index, color in enumerate(pal)}
            picture_pal = [[pal_obj[color] for color in line] for line in picture]
            picture_int = picture_to_int(picture_pal, width, cardinality)

            literal = js_literal(picture_int)
            if short_literal is None or len(literal) < len(short_literal):
                short_literal = literal
                short_pal = pal

        contents = OUT_FILE % (short_literal, width, height, cardinality, js_palette(short_pal))
        out_file = OUT_DIR / (png_file.stem + '.ts')
        out_file.write_text(contents, encoding='utf-8', newline='\n')


def build_inline():
    index = (BUILD_DIR / 'index.html').read_text(encoding='utf-8')
    app_css = (BUILD_DIR / 'app.opt.css').read_text(encoding='utf-8')
    app_js = (BUILD_DIR / 'app.opt.js').read_text(encoding='utf-8')

    # https://html.spec.whatwg.org/multipage/parsing.html#rawtext-state
    assert '</' not in app_css
    # https://html.spec.whatwg.org/multipage/parsing.html#script-data-state
    assert '</' not in app_js
    assert '<!' not in app_js

    assert HTML_LINK_CSS in index
    index = index.replace(HTML_LINK_CSS, HTML_INLINE_CSS % app_css, 1)
    assert HTML_LINK_JS in index
    index = index.replace(HTML_LINK_JS, HTML_INLINE_JS % app_js, 1)

    (BUILD_DIR / 'index.html').write_text(index, encoding='utf-8', newline='\n')


def build_validate():
    for file in list(OUR_ROOT.glob('out/**/*.js')):
        content = file.read_text(encoding='utf-8')
        if not content.startswith(FILE_LICENSE):
            raise RuntimeError(f'Invalid file header: {file.relative_to(OUR_ROOT)}')

        if '// .' in content:
            raise RuntimeError(f'Leftover Michikoid syntax: {file.relative_to(OUR_ROOT)}')


if __name__ == '__main__':
    if len(sys.argv) != 2 or sys.argv[1] not in ('pictures', 'inline', 'validate'):
        print('Usage: build.py <pictures | inline | validate>')
        print('To rebuild the entire thing, run `build.sh` instead.')
        sys.exit(-1)

    match sys.argv[1]:
        case 'pictures':
            build_pictures()
        case 'inline':
            build_inline()
        case 'validate':
            build_validate()
