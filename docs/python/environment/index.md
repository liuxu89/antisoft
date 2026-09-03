# 从 pip 到 uv：现代 Python 项目管理全流程

视频的节奏其实很清晰：不是一个个孤立命令的罗列，而是一边问“为什么”，一边把工具链一层层升级上去。下面按这个思路整理。

我们会沿着这条线走：

```text
pip（能装，但管不住环境）
  → venv（每个项目一个环境）
  → pip freeze / requirements.txt（记录环境）
  → pyproject.toml（项目自己说话）
  → pip install -e .（开发期把项目装进环境）
  → uv（更现代的统一工作流）
```

---

## 0. 先说一个常被吐槽的点：Python 的项目管理为什么容易乱

对比其他语言：

- Java 有 Maven / Gradle，项目结构、依赖、构建都有相对统一的标准；
- Node.js 有 `package.json` + `node_modules`，项目级依赖是默认习惯；
- Go 有 `go.mod`，模块化从语言层面就被照顾到了。

而 Python 早期给人的感觉是：

> 装个包就完事了，`site-packages` 是全局的。

所以“环境管理”这件事在 Python 里不是生来就有，而是后来被逼出来的。我们的学习主线，也正好是 Python 解决这些问题的演进过程。

---

## 1. pip 只解决“怎么装”，不解决“装到哪里”

`pip install requests` 确实很方便，但它默认装到**当前 Python 解释器对应的环境**里。

如果一开始没有虚拟环境，那这个“当前环境”往往就是全局环境。于是很快会撞上问题：

```text
项目 A：需要 Django 3.2
项目 B：需要 Django 5.0

全局 site-packages 里只能装一个 Django
```

结论：**pip 解决了“安装”这个动作，但没有解决“安装到哪、和谁隔离”这个问题。**

所以下一步不是换工具，而是引入环境隔离。

---

## 2. venv：给每个项目一个独立环境

### 2.1 venv 解决什么

`venv` 的核心思想是：

> 不把包都塞进全局 `site-packages`，而是在项目目录下创建一个轻量、独立的 Python 环境。

历史上社区先出现了 `virtualenv`，Python 3.3 起（PEP 405）把官方的 `venv` 放进标准库。

### 2.2 创建

```bash
python -m venv .venv
```

- `.venv` 是约定俗成的目录名；
- 用 `python -m venv` 可以明确调用**当前 Python** 所对应的 `venv` 模块。

### 2.3 激活

Linux / macOS：

```bash
source .venv/bin/activate
```

Windows：

```powershell
.venv\Scripts\activate
```

激活后，终端提示符前通常会出现 `(.venv)`。此时：

```bash
# 检查当前解释器是否来自这个虚拟环境
which python
# 应指向：/你的项目路径/.venv/bin/python
```

### 2.4 退出

```bash
deactivate
```

### 2.5 一个常见误区：.venv 不能直接拷给别人

虚拟环境看起来就是一个目录，但它内部包含：

- 解释器入口；
- 平台相关的二进制；
- 写死的绝对路径；
- 当前环境的 `site-packages`。

所以把 `.venv` 复制到另一台电脑，很容易出现路径不对、平台不兼容、Python 版本对不上等问题。

**正确的做法是：用 `venv` 创建环境，再通过依赖文件把环境重现出来。**

---

## 3. pip freeze / requirements.txt：把环境状态固定下来

### 3.1 为什么需要

有了 venv，项目之间不打架了。但还有一个问题：

> 换了台电脑，或者别人拉下你的项目，怎么把环境装成一模一样？

### 3.2 基本流程

```bash
# 在虚拟环境中安装依赖
pip install django

# 把当前环境所有包和版本导出
pip freeze > requirements.txt
```

`requirements.txt` 大约长这样：

```text
asgiref==3.8.1
Django==5.0.6
sqlparse==0.5.0
```

新环境里：

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3.3 pip freeze 的定位和局限

- ✅ 它能完整快照当前环境；
- ❌ 它是“环境视角”的，包含所有传递依赖；
- ❌ 不同平台、不同 Python 版本导出的内容可能有差异；
- ❌ 手动长期维护一大份 freeze 列表，很痛苦。

所以 `requirements.txt` 有两种常见用法：

| 用法 | 定位 |
|---|---|
| 手写 | 只列直接依赖，例如 `Django>=5.0` |
| `pip freeze > requirements.txt` | 完整锁定环境，用于部署复现 |

到这里，环境可以被记录和复现了，但项目自身的信息还没有被正式管理起来。于是进入项目文件管理。

---

## 4. pyproject.toml：让项目自己“说话”

### 4.1 为什么要项目文件

如果只看 `requirements.txt`，你只知道“这个环境装了 Django”，但不知道：

- 这个项目叫什么；
- 版本是多少；
- 它自身的 Python 版本要求；
- 哪些依赖是运行时依赖，哪些只是开发依赖。

这些问题需要由项目自身来回答。Python 社区最终把答案统一到了 `pyproject.toml`——它有点像 Java 的 `pom.xml`、Node.js 的 `package.json`，但用 TOML 格式。

### 4.2 最小示例

```toml
[build-system]
requires = ["setuptools>=61"]
build-backend = "setuptools.build_meta"

[project]
name = "my-project"
version = "0.1.0"
description = "我的项目"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.28",
    "click>=8.0",
]

[project.optional-dependencies]
dev = [
    "pytest",
    "ruff",
]
```

- `[project]` 描述项目元数据和直接依赖；
- `[build-system]` 描述构建这个项目需要什么工具；
- `[project.optional-dependencies]` 描述可选依赖组，例如 `dev`。

### 4.3 与 requirements.txt 的关系

```text
pyproject.toml     → 回答“这个项目是什么、直接依赖哪些”
requirements.txt   → 回答“这个环境目前装了什么、如何复现”
```

两者的分工可以同时存在，并不冲突。

---

## 5. pip install -e .：开发时把项目也“装进”环境

### 5.1 为什么有时需要安装项目自己

如果你的项目不止一个文件，而是一个包：

```text
my_project/
├── pyproject.toml
├── src/
│   └── my_project/
│       ├── __init__.py
│       ├── a.py
│       └── b.py
```

你可能需要在别的脚本里 `import my_project`。这时光在项目目录里写代码还不够，需要让环境认识“这个包存在并且可以导入”。

### 5.2 普通安装 vs 可编辑安装

```bash
# 普通安装：把项目复制到 site-packages
pip install .

# 可编辑安装：安装“源码目录本身”
pip install -e .
```

`pip install -e .` 的典型用途是开发：

- 修改源码后，不需要重新安装；
- 重启进程就能看到最新代码；
- 同时还会安装 `pyproject.toml` 里声明的依赖。

需要 dev 依赖组时：

```bash
pip install -e ".[dev]"
```

### 5.3 原理

普通安装会把源码复制到 `site-packages`；可编辑安装则写入一个指向源码目录的 `.pth` 文件（现代实现里是 `__editable__` 相关文件），让 Python 启动时把这个源码路径加入 `sys.path`。

PEP 660 之后，这套机制在 `pyproject.toml` 时代被标准化。

---

## 6. uv：更现代的统一工作流

### 6.1 传统工具链的痛点

发展到这一步，工具已经不少了：

```text
venv + pip + requirements.txt + pyproject.toml + pip-tools + ...
```

而且：

- `pip` 安装速度相对慢；
- 不同工具生成的锁文件不统一；
- 每次新项目都要手动重复：建 venv → 激活 → 装依赖 → 导出依赖。

`uv` 就是在这个背景下出现的。它用 Rust 编写，目标是统一并加速整个 Python 项目管理流程。

### 6.2 常用命令

```bash
# 创建虚拟环境
uv venv

# 初始化项目（自动生成 pyproject.toml 等）
uv init

# 添加依赖到 pyproject.toml
uv add requests

# 安装项目声明的所有依赖
uv sync

# 直接运行脚本
uv run python main.py

# 生成/更新锁定文件
uv lock

# 兼容 pip 的用法
uv pip install requests
uv pip freeze
uv pip install -r requirements.txt
uv pip install -e .
```

### 6.3 像什么？

如果你熟悉 Node.js 或 Rust：

```text
uv add        ≈  npm install <pkg> / cargo add
uv sync       ≈  npm install / cargo update
uv run        ≈  npm run / cargo run
uv lock       ≈  lockfile 机制
```

它并不是简单在背后调用 pip，而是重新实现了类似 pip 的功能，所以速度更快，行为也更统一。

### 6.4 学习建议

`uv` 很好用，但建议还是先理解 `venv + pip + pyproject.toml` 这条传统链路，再切换到 `uv`。否则你只会觉得“很快”，但不清楚它替你做完了哪些步骤。

---

## 7. 一页总结

| 工具/文件 | 解决什么问题 | 常用命令 |
|---|---|---|
| `pip` | 安装包 | `pip install requests` |
| `venv` | 项目级隔离环境 | `python -m venv .venv` |
| `pip freeze` | 导出环境快照 | `pip freeze > requirements.txt` |
| `requirements.txt` | 记录/复现环境 | `pip install -r requirements.txt` |
| `pyproject.toml` | 声明项目元数据与依赖 | `[project]` + `dependencies` |
| `pip install -e .` | 可编辑安装项目 | `pip install -e .` |
| `uv` | 统一、快速的项目与依赖管理 | `uv add` / `uv sync` / `uv run` |

这条主线理解后，以后看到任何新的 Python 项目管理工具，你都只需要问三个问题：

1. 它如何解决**环境隔离**？
2. 它如何记录**依赖与锁定**？
3. 它如何声明**项目自身的信息**？
