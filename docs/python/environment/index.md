# Python 环境管理基础

这一页汇总 Python 环境与依赖管理最常用的几个知识点：

1. `venv`：创建虚拟环境
2. `pip freeze`：导出/锁定依赖
3. `pip install -e .`：可编辑安装本地项目
4. `pyproject.toml`：项目元数据与依赖声明
5. `uv`：更快的现代包管理工具

它们之间的关系大致是：

```text
pyproject.toml / requirements.txt
        │  声明依赖
        ▼
venv / uv venv
        │  创建隔离环境
        ▼
pip install / uv sync
        │  安装依赖
        ▼
pip freeze / uv lock
        │  锁定版本
        ▼
可复现的环境
```

---

## 1. venv：创建虚拟环境

虚拟环境用于给每个项目一个**独立**的 Python 解释器和 `site-packages`，避免项目之间的依赖冲突。

### 创建

```bash
python -m venv .venv
```

- `.venv` 是约定俗成的目录名。
- 使用 `python -m venv` 比直接写 `venv` 更可靠，因为它明确使用当前 Python 解释器对应的 venv 模块。

### 激活

Linux / macOS：

```bash
source .venv/bin/activate
```

Windows：

```powershell
.venv\Scripts\activate
```

### 退出

```bash
deactivate
```

### 判断是否在虚拟环境中

激活后，命令行提示符前通常会出现 `(.venv)`。也可以用以下命令查看当前解释器路径：

```bash
which python
# Linux/macOS 示例输出：/path/to/project/.venv/bin/python
```

---

## 2. pip freeze：导出依赖

`pip freeze` 会列出当前环境中安装的**所有包及其版本**，格式为 `包名==版本号`。

### 常见用法

```bash
# 查看当前环境所有包
pip freeze

# 导出到 requirements.txt
pip freeze > requirements.txt

# 在新环境按列表安装
pip install -r requirements.txt
```

### 注意事项

- `pip freeze` 输出的是**当前环境的全部包**，包括传递依赖。
- 如果项目里用 `venv`，建议每个项目单独导出自己的 `requirements.txt`。
- 不建议手动维护一个“只写直接依赖”的 `requirements.txt` 后再混用 `pip freeze`，两者定位不同：
  - `requirements.txt`：可以是手写的直接依赖，也可以是 freeze 出来的锁定文件。
  - `pip freeze`：更适合作为**锁定文件**，完整复现环境。

---

## 3. pip install -e .：可编辑安装

把一个本地项目以**可编辑模式**安装到当前环境。核心作用是：**改了源码立即生效，不用重新安装**。

### 用法

在项目根目录（包含 `pyproject.toml` 的目录）执行：

```bash
pip install -e .
```

如果项目声明了额外依赖组（例如 dev）：

```bash
pip install -e ".[dev]"
```

### 原理简述

可编辑安装不会把代码复制到 `site-packages`，而是写入一个指向项目源码目录的 `.pth` 文件（或 `__editable__` 相关文件）。Python 启动时会把这个路径加入 `sys.path`，所以可以直接 `import` 项目包，并且代码修改实时生效。

### 适用场景

- 开发自己写的包 / 库。
- 项目源码在本地，需要在环境里以包的方式导入。

---

## 4. pyproject.toml：项目元数据与依赖声明

`pyproject.toml` 是现代 Python 项目的**标准配置文件**，用于声明项目信息、依赖、构建系统和工具配置。

### 最小示例

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

### 与旧文件的关系

- `setup.py` / `setup.cfg`：旧式打包配置，逐渐被 `pyproject.toml` 取代。
- `requirements.txt`：通常用于部署/锁定运行依赖，`pyproject.toml` 更多用于**声明项目本身**。
- 实际项目中常见组合：`pyproject.toml` 声明项目，`requirements.txt` 或 `uv.lock` 锁定环境。

---

## 5. uv：更快的 Python 包与项目管理器

[uv](https://docs.astral.sh/uv/) 是一个用 Rust 写的 Python 包管理器，可以替代 `pip`、`venv`、`pip-tools` 等工具，速度更快。

### 常用命令

```bash
# 创建虚拟环境
uv venv

# 在虚拟环境里安装包
uv pip install requests

# 从 requirements.txt 安装
uv pip install -r requirements.txt

# 在已有项目里初始化
uv init

# 添加依赖（会写入 pyproject.toml）
uv add requests

# 安装项目声明的所有依赖
uv sync

# 直接运行脚本
uv run python main.py

# 导出锁定文件
uv lock
```

### 和传统工具对比

| 传统命令 | uv 对应 |
|---|---|
| `python -m venv .venv` | `uv venv` |
| `pip install requests` | `uv pip install requests` / `uv add requests` |
| `pip freeze` | `uv pip freeze` |
| `pip install -r requirements.txt` | `uv pip install -r requirements.txt` |
| `pip install -e .` | `uv pip install -e .` |

> 后续学习过程中，这里可以继续拆分成独立页面，按主题深入。
