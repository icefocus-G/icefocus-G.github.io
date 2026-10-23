# -*- coding: utf-8 -*-
"""预跑 C# 课件的全部代码段，把真实输出写成静态数据。

为什么要预跑：站点是 GitHub Pages 纯静态托管，没有服务器能编译 C#。
所以在 GitHub Actions 里用 dotnet 把每段示例真跑一遍，把 stdout / 编译错误
落成 assets/run-output.json，页面「▶ 运行」只是回放这份数据。

用法：
    python3 tools/run_examples.py            # 全量跑，写 assets/run-output.json
    python3 tools/run_examples.py --limit 20 # 只跑前 20 段（调试用）

键规则：<模块id>#<序号>，序号 = 该模块 .doc 内 <pre class="code"> 的出现次序，
与 assets/atlas.js 在页面上收集代码的顺序一致。每条另存 n（源码字符数），
页面用它校验「数据是否与当前代码同步」。
"""
import os, re, io, json, html, sys, time, shutil, subprocess, tempfile, argparse, traceback

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, 'assets', 'run-output.json')

USINGS = (
    "using System;\n"
    "using System.Collections.Generic;\n"
    "using System.Linq;\n"
    "using System.Text;\n"
    "using System.Threading;\n"
    "using System.Threading.Tasks;\n"
)

CSPROJ = """<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>{kind}</OutputType>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>disable</Nullable>
    <ImplicitUsings>disable</ImplicitUsings>
    <AssemblyName>runex</AssemblyName>
    <RootNamespace>RunEx</RootNamespace>
    <EnableDefaultCompileItems>false</EnableDefaultCompileItems>
    <GenerateDocumentationFile>false</GenerateDocumentationFile>
    <NoWarn>CS0105;CS0168;CS0219;CS0414;CS8321;CS7022</NoWarn>
    <InvariantGlobalization>true</InvariantGlobalization>
  </PropertyGroup>
  <ItemGroup>
    <Compile Include="Program.cs" />
  </ItemGroup>
</Project>
"""


GLOBAL_JSON = '{\n  "sdk": {\n    "version": "9.0.0",\n    "rollForward": "latestFeature"\n  }\n}\n'


def modules():
    out = []
    for f in sorted(os.listdir(HERE)):
        m = re.fullmatch(r'(m\d+)\.html', f)
        if m:
            out.append((m.group(1), os.path.join(HERE, f)))
    return out


def snippets(path):
    """按 DOM 顺序取 .doc 里的代码段（与 atlas.js 一致）。"""
    s = io.open(path, encoding='utf-8').read()
    i = s.find('<article class="doc">')
    if i < 0:
        return []
    body = s[i:]
    out = []
    for m in re.finditer(r'<pre class="code"[^>]*><code>(.*?)</code></pre>', body, re.S):
        code = m.group(1)
        code = re.sub(r'<[^>]+>', '', code)
        out.append(html.unescape(code))
    return out


def shape(code):
    """判断能力：run / lib / stmt"""
    if re.search(r'static\s+(async\s+)?(void|int|Task)\s+Main\s*\(', code):
        return 'run'
    if re.search(r'^\s*(public\s+|internal\s+|sealed\s+|abstract\s+|static\s+|partial\s+)*'
                 r'(class|struct|interface|enum|record)\s+\w+', code, re.M):
        return 'lib'
    return 'stmt'


def wrap(code, kind, mode):
    if kind == 'run' or mode == 'asis':
        return USINGS + code
    if mode == 'main':
        return USINGS + "class __P\n{\n    static void Main()\n    {\n" + code + "\n    }\n}\n"
    # mode == 'class'：语句当字段/成员，编译但不执行
    return USINGS + "class __P\n{\n" + code + "\n    static void Main() { }\n}\n"


def build(root, kind):
    with io.open(os.path.join(root, 'global.json'), 'w', encoding='utf-8') as f:
        f.write(GLOBAL_JSON)
    with io.open(os.path.join(root, 'ex.csproj'), 'w', encoding='utf-8') as f:
        f.write(CSPROJ.format(kind=kind))
    p = subprocess.run(['dotnet', 'build', '-v', 'q', '--nologo', '-c', 'Release'],
                       cwd=root, capture_output=True, text=True, errors='replace',
                       timeout=180)
    return p.returncode, (p.stdout or '') + (p.stderr or '')


def run_dll(root, timeout=8):
    dll = os.path.join(root, 'bin', 'Release', 'net9.0', 'runex.dll')
    if not os.path.exists(dll):
        return 1, '', '未生成可执行文件'
    try:
        p = subprocess.run(['dotnet', dll], cwd=root, capture_output=True, text=True,
                           errors='replace', timeout=timeout, stdin=subprocess.DEVNULL)
        return p.returncode, p.stdout, p.stderr
    except subprocess.TimeoutExpired as e:
        o = (e.stdout or b'')
        if isinstance(o, bytes):
            o = o.decode('utf-8', 'replace')
        return 124, o, '运行超时（> %ds），可能有死循环或等待输入' % timeout


def clean_err(txt):
    """只留 CS 错误行，去掉路径噪音。"""
    lines = []
    for ln in (txt or '').splitlines():
        m = re.search(r'error (CS\d+):\s*([^\[]*?)(?:\s*\[[^\]]*\])?\s*$', ln)
        if m and len(lines) < 3:
            msg = m.group(2).strip()
            if msg:
                lines.append('%s: %s' % (m.group(1), msg))
    return '\n'.join(lines) if lines else ''


def clean_out(txt, limit=3000):
    txt = (txt or '').replace('\r\n', '\n').strip()
    if len(txt) > limit:
        txt = txt[:limit] + '\n…（输出过长，已截断）'
    return txt


def run():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=0)
    args = ap.parse_args()

    root = tempfile.mkdtemp(prefix='csbook-run-')
    data = {'generated': time.strftime('%Y-%m-%d %H:%M:%S'), 'runtime': '', 'items': {}}
    try:
        # 固定到 9.0：CI runner 自带更新的 SDK（实测 10.0.401），不锁的话
        # 页面显示的版本号会跟着 runner 变，和 README 写的 dotnet 9 对不上。
        with io.open(os.path.join(root, 'global.json'), 'w', encoding='utf-8') as f:
            f.write(GLOBAL_JSON)
        v = subprocess.run(['dotnet', '--version'], cwd=root, capture_output=True, text=True,
                           errors='replace').stdout.strip()
        data['runtime'] = 'dotnet ' + v

        total = 0
        for mid, path in modules():
            list_ = snippets(path)
            if not list_:
                continue
            for idx, code in enumerate(list_):
                key = '%s#%d' % (mid, idx)
                rec = {'n': len(code)}
                kind = shape(code)
                try:
                    if kind == 'lib':
                        rc, log = build(root, 'Library')
                        if rc == 0:
                            rec.update(s='lib', o='', e='')
                        else:
                            rec.update(s='fail', o='', e=clean_err(log))
                    elif kind == 'stmt':
                        with io.open(os.path.join(root, 'Program.cs'), 'w', encoding='utf-8') as f:
                            f.write(wrap(code, kind, 'main'))
                        rc, log = build(root, 'Exe')
                        if rc != 0:
                            # 退化：当类成员，编译即止
                            with io.open(os.path.join(root, 'Program.cs'), 'w', encoding='utf-8') as f:
                                f.write(wrap(code, kind, 'class'))
                            rc2, log2 = build(root, 'Exe')
                            if rc2 == 0:
                                rec.update(s='lib', o='', e='')
                            else:
                                rec.update(s='fail', o='', e=clean_err(log) or clean_err(log2))
                        else:
                            rc, out, err = run_dll(root)
                            rec.update(s='ok' if rc == 0 else 'runerr',
                                       o=clean_out(out), e=clean_out(err, 800))
                    else:  # run
                        with io.open(os.path.join(root, 'Program.cs'), 'w', encoding='utf-8') as f:
                            f.write(wrap(code, kind, 'asis'))
                        rc, log = build(root, 'Exe')
                        if rc != 0:
                            rec.update(s='fail', o='', e=clean_err(log))
                        else:
                            rc, out, err = run_dll(root)
                            rec.update(s='ok' if rc == 0 else 'runerr',
                                       o=clean_out(out), e=clean_out(err, 800))
                except subprocess.TimeoutExpired:
                    rec.update(s='fail', o='', e='编译超时')
                except Exception as e:  # 单个失败不影响整批
                    rec.update(s='fail', o='', e=str(e)[:200])

                data['items'][key] = rec
                total += 1
                if args.limit and total >= args.limit:
                    break
                if total % 20 == 0:
                    print('  ... 已处理 %d 段' % total, flush=True)
            if args.limit and total >= args.limit:
                break
    finally:
        shutil.rmtree(root, ignore_errors=True)

    with io.open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    stat = {}
    for r in data['items'].values():
        stat[r['s']] = stat.get(r['s'], 0) + 1
    print('完成：%d 段 → %s' % (len(data['items']), OUT))
    print('分布：', stat)


def main():
    """统一入口：任何顶层异常都写进 GITHUB_STEP_SUMMARY，否则 Actions 里只能看到 exit 1。"""
    try:
        run()
    except SystemExit:
        raise
    except Exception:
        tb = traceback.format_exc()
        print(tb, file=sys.stderr, flush=True)
        summary = os.environ.get('GITHUB_STEP_SUMMARY')
        if summary:
            with io.open(summary, 'a', encoding='utf-8') as f:
                f.write('## C# 示例预跑失败\n\n```\n%s\n```\n' % tb[-4000:])
        sys.exit(1)


if __name__ == '__main__':
    main()
