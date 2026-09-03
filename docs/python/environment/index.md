# Python 环境管理：从“全局”到“隔离”，再到“现代工作流”

学环境管理，最怕的是一上来就死记命令。其实这些工具都是被一个个真实问题“逼”出来的。顺着历史走一遍，你会更容易理解它们为什么存在。

本文覆盖五个知识点：

1. `venv`
2. `pip freeze`
3. `pip install -e .`
4. `pyproject.toml`
5. `uv`

---

## 1. 最原始的问题：一个全局 Python

刚装好 Python 时，你的电脑上只有一个全局环境。无论你写多少个项目，`import` 的时候都去同一个 `site-packages` 目录里找包。

这看起来方便，但很快会出问题。

### 场景

```text
项目 A：需要 Django 3.2
项目 B：需要 Django 5.0

全局 site-packages 里只能装一个 Django。
装了 5.0，项目 A 挂；装了 3.2，项目 B 挂。
```

### 本质矛盾

- 不同项目需要不同版本的同一个包；
- 同一个环境里，一个包只能有一个版本；
- 项目之间互相“污染”。

所以第一个需求出现了：**给每个项目一个独立的环境。**

---

## 2. 第一次进化：venv 隔离环境

最开始，社区先有了第三方的 `virtualenv`。后来 Python 官方把它吸收进标准库，也就是 `venv`（Python 3.3 起，见 PEP 405）。

`venv` 的思路很朴素：

> 不复制整个 Python，而是在项目里生成一个“轻量环境壳子”，里面有独立的 `site-packages` 和解释器入口。

### 创建虚拟环境

```bash
python -m venv .venv
```

说明：

- `.venv` 是约定俗成的环境目录名，放项目根目录；
- 用 `python -m venv` 而不是直接写 `venv`，可以确保调用的是**当前这个 Python** 对应的 venv 模块。

### 激活环境

Linux / macOS：

```bash
source .venv/bin/activate
```

Windows：

```powershell
.venv\Scripts\activate
```

激活后，命令行提示符前面通常会出现 `(.venv)`。

### 验证当前用的是哪个 Python

```bash
which python
# 应该指向：/你的项目路径/.venv/bin/python
```

### 退出环境

```bash
deactivate
```

### venv 解决了什么，没解决什么

✅ 解决：项目之间的依赖隔离。

❌ 还没解决：环境里到底装了哪些包？换台电脑怎么复现？——于是有了 `pip freeze`。

---

## 3. 环境的快照：pip freeze

有了隔离环境，第二个问题随之而来：

> 我这个环境里装了这么多包，怎么记下来？同事或服务器怎么装成一样？

`pip freeze` 就是干这个的：把当前环境里的**所有包和版本**输出成 `包名==版本号` 的列表。

### 基本用法

```bash
# 查看当前环境装了哪些包
pip freeze

# 导出到 requirements.txt
pip freeze > requirements.txt
```

导出的文件大概长这样：

```text
asgiref==3.8.1
Django==5.0.6
sqlparse==0.5.0
```

### 复现环境

拿到 `requirements.txt` 之后，在新的 venv 里执行：

```bash
pip install -r requirements.txt
```

### pip freeze 的定位与局限

它更像一张**环境快照**：

- ✅ 完整记录了当前环境的所有包（包括传递依赖）；
- ✅ 适合把环境“冻结”下来复现；
- ❌ 但它是**全量**的，不区分“直接依赖”和“传递依赖”；
- ❌ 不同平台/不同 Python 版本下，freeze 出来的内容可能有差异；
- ❌ 手动维护一大张 freeze 列表，时间长了容易冗余、冲突。

所以实践中常见两种用法：

| 文件 | 定位 |
|---|---|
| 手写 `requirements.txt` | 只写项目直接依赖，例如 `Django>=5.0` |
| freeze 生成的 `requirements.txt` | 锁定完整环境，用于部署复现 |

这里已经出现了一个隐藏需求：**依赖信息不应该只存在于环境里，而应该声明在项目里。** 这就引出了 `pyproject.toml`。

---

## 4. 从“环境”到“项目”：pyproject.toml 与 pip install -e .

### 4.1 历史：setup.py 时代

早期 Python 项目如果想“安装自己”，要写 `setup.py`，里面调用 `setuptools.setup(...)`。这套机制能工作，但有几个问题：

- `setup.py` 是 Python 代码，配置和逻辑混在一起；
- 字段分散，工具之间不统一；
- 读取配置前要先执行代码，既慢又可能有副作用。

后来社区逐步推进标准化，把配置统一到 `pyproject.toml`：

- PEP 518：先解决“构建项目需要哪些构建依赖”；
- PEP 621：再规定项目元数据（名称、版本、依赖等）写在 `[project]` 里。

### 4.2 pyproject.toml 最小示例

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

这样，项目“自己是什么、依赖什么”就清清楚楚地写在仓库里了。

### 4.3 pip install -e .：把项目装进环境，但保留源码位置

光有 `pyproject.toml` 还不够。我们开发时希望：

> 代码在项目目录里改，环境里立刻生效，不要每次重新安装。

这就是**可编辑安装（editable install）**。

在项目根目录（有 `pyproject.toml` 的目录）执行：

```bash
pip install -e .
```

如果还需要安装开发依赖组：

```bash
pip install -e ".[dev]"
```

### 可编辑安装的原理

普通的 `pip install .` 会把项目代码复制到 `site-packages` 里；而 `pip install -e .` 不复制，而是写一个指向项目源码目录的 `.pth` 文件（新机制下是 `__editable__` 相关文件）。Python 启动时会把源码路径加入 `sys.path`。

结果就是：

- `import my_project` 导入的**始终是源码目录里的代码**；
- 你改一行，不用重装，重启进程即生效。

PEP 660 后来专门标准化了 `pyproject.toml` 时代的可编辑安装。

### 4.4 工具分工逐渐清晰

到这里，可以这样理解：

| 工具/文件 | 回答什么问题 |
|---|---|
| `venv` | 项目运行在哪个隔离环境里？ |
| `pyproject.toml` | 这个项目是什么、直接依赖有哪些？ |
| `pip install -e .` | 开发时如何把项目装进环境，同时保留源码可改？ |
| `pip freeze` / `requirements.txt` | 当前环境完整快照，如何整机复现？ |

---

## 5. 更现代的答案：uv

传统工具链虽然完整，但痛点也很明显：

- 工具是拼起来的：`venv` + `pip` + `requirements.txt` + `pip-tools` + …；
- `pip` 装包速度慢，尤其在大项目里；
- 锁定文件不统一：有的用 `requirements.txt`，有的用 `pip-tools` 的 `requirements.in`，还有 Poetry 的 `poetry.lock`。

`uv` 是 Astral 团队用 Rust 写的现代 Python 包与项目管理器，目标就是把这一整套统一起来，并且快很多。

### uv 的常用命令

```bash
# 创建虚拟环境
uv venv

# 安装包
uv pip install requests

# 从 requirements.txt 安装
uv pip install -r requirements.txt

# 初始化项目
uv init

# 添加依赖（自动写入 pyproject.toml）
uv add requests

# 同步项目声明的依赖到环境
uv sync

# 直接运行脚本
uv run python main.py

# 生成/更新锁定文件
uv lock

# 查看当前环境的依赖
uv pip freeze
```

### 与传统命令对照

| 传统命令 | uv 对应 |
|---|---|
| `python -m venv .venv` | `uv venv` |
| `pip install requests` | `uv pip install requests` / `uv add requests` |
| `pip freeze` | `uv pip freeze` |
| `pip install -r requirements.txt` | `uv pip install -r requirements.txt` |
| `pip install -e .` | `uv pip install -e .` |

### 学习建议

`uv` 很快，但它是在解决传统工具的问题。建议你先用 `venv + pip` 把基础流程跑一遍，再切换到 `uv`，你会更清楚每一步背后发生了什么。

---

## 6. 回顾：一条发展线

```text
全局环境
  │ 问题：项目之间依赖冲突
  ▼
venv（隔离环境）
  │ 问题：环境里的包无法记录和复现
  ▼
pip freeze / requirements.txt（环境快照）
  │ 问题：项目自身的元数据和依赖应该声明在项目里
  ▼
pyproject.toml（项目声明）
  │ 问题：开发时需要改源码立即生效
  ▼
pip install -e .（可编辑安装）
  │ 问题：传统工具多而慢，锁定文件不统一
  ▼
uv（统一现代工作流）
```

---

## 7. 一页总结

| 知识点 | 核心作用 | 常用命令 |
|---|---|---|
| `venv` | 创建隔离环境 | `python -m venv .venv` |
| `pip freeze` | 导出环境快照 | `pip freeze > requirements.txt` |
| `pyproject.toml` | 声明项目元数据和依赖 | `[project]` + `dependencies` |
| `pip install -e .` | 可编辑安装本地项目 | `pip install -e .` / `pip install -e ".[dev]"` |
| `uv` | 统一、快速地管理环境和依赖 | `uv venv` / `uv add` / `uv sync` / `uv run` |

后续这一页可以继续拆分成独立文章，按主题深入，但先抓住这条主线，你会知道每个工具站在哪个位置。
