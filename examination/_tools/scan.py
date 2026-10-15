#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""课程目录扫描器

作用：扫描 examination/ 下所有课程目录，回写 examination/courses.json 的 fallback 清单，
      并检查每个目录的 course.json 是否齐全。

什么时候需要跑：**基本不用**。课程中心内置了 GitHub API 自动发现，
                丢个目录上去它自己会认出来。这个脚本是给
                「本地预览 / 断网 / 想一次性体检」准备的。

用法：
    cd examination
    python _tools/scan.py            # 扫描并回写 courses.json
    python _tools/scan.py --check    # 只体检，不改文件
"""

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
EXAM = os.path.dirname(HERE)          # examination/
CFG = os.path.join(EXAM, 'courses.json')

SKIP_PREFIX = ('_', '.')
# 保留目录：通用壳 / 模板 / 工具等，不是课程。与 courses.json 的 reserved 保持一致。
SKIP_NAMES = {'shell', 'template', 'tools', 'assets', 'data', 'script'}


def scan():
    dirs = []
    for name in sorted(os.listdir(EXAM)):
        p = os.path.join(EXAM, name)
        if not os.path.isdir(p):
            continue
        if name.startswith(SKIP_PREFIX) or name in SKIP_NAMES:
            continue
        cj = os.path.join(p, 'course.json')
        meta = None
        if os.path.exists(cj):
            try:
                meta = json.load(open(cj, encoding='utf-8'))
            except Exception as e:
                meta = {'_err': str(e)}
        dirs.append((name, meta, sorted(
            f for f in os.listdir(p) if os.path.isfile(os.path.join(p, f)))))
    return dirs


def health(meta):
    if meta is None:
        return 'warn', '没有 course.json（课程中心会把目录名当课程名，点进去是占位页）'
    if '_err' in meta:
        return 'bad', 'course.json 解析失败：' + meta['_err']
    st = meta.get('status', 'live')
    if st != 'live':
        return 'idle', 'status=%s（未启用）' % st
    missing = []
    pages = meta.get('pages') or {}
    for k in ('outline', 'bank'):
        f = (pages.get(k) or {}).get('file')
        if f and not os.path.exists(os.path.join(EXAM, meta.get('_dir', ''), f)):
            missing.append(f)
    if not meta.get('cn'):
        missing.append('cn（课程名）')
    if missing:
        return 'warn', '缺：' + '、'.join(missing)
    return 'ok', '正常'


def main():
    check_only = '--check' in sys.argv
    rows = scan()

    print('课程目录扫描：%s' % EXAM)
    print('=' * 78)
    print('%-24s %-10s %-6s %s' % ('目录', '课程名', '状态', '体检'))
    print('-' * 78)
    names = []
    n_live = 0
    for name, meta, files in rows:
        if meta:
            meta['_dir'] = name
        lvl, msg = health(meta)
        icon = {'ok': '✔', 'warn': '⚠', 'bad': '✘', 'idle': '·'}[lvl]
        cn = (meta or {}).get('cn') or '（按目录名）'
        st = (meta or {}).get('status') or 'live'
        if st == 'live' and lvl == 'ok':
            n_live += 1
        print('%-24s %-10s %-6s %s %s' % (name, cn[:10], st, icon, msg))
        names.append(name)

    print('-' * 78)
    print('共 %d 个目录，其中 %d 门已上线' % (len(names), n_live))

    if check_only:
        return

    cfg = {}
    if os.path.exists(CFG):
        try:
            cfg = json.load(open(CFG, encoding='utf-8'))
        except Exception:
            cfg = {}
    old = cfg.get('fallback') or []
    cfg['fallback'] = names
    with open(CFG, 'w', encoding='utf-8') as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('\n已回写 %s 的 fallback（%d 条）' % (os.path.basename(CFG), len(names)))
    added = [n for n in names if n not in old]
    gone = [n for n in old if n not in names]
    if added:
        print('  新增：' + '、'.join(added))
    if gone:
        print('  移除：' + '、'.join(gone))


if __name__ == '__main__':
    main()
