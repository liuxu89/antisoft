# python -m 的用法

`python -m` 用于**把模块当作脚本运行**。它与直接运行 `.py` 文件看起来相似，但实际行为有几个重要区别。

## 基本语法

```bash
python -m 模块名 [参数...]
```

例如：

```bash
# 启动一个简单的 HTTP 服务器
python -m http.server 8000

# 格式化 JSON 输出
python -m json.tool data.json

# 创建虚拟环境
python -m venv .venv

# 使用 pip
python -m pip install requests
```

## 常见内置模块用法

| 命令 | 作用 |
|---|---|
| `python -m http.server 8000` | 在当前目录启动静态文件服务器 |
| `python -m json.tool` | 格式化 / 校验 JSON |
| `python -m venv .venv` | 创建虚拟环境 |
| `python -m pip install ...` | 调用 pip |
| `python -m site` | 查看 Python 的模块搜索路径等信息 |
| `python -m unittest` | 运行测试 |
| `python -m pdb script.py` | 调试脚本 |
| `python -m timeit -s "..." "..."` | 测试小段代码执行时间 |
| `python -m ensurepip` | 安装 / 修复 pip |
| `python -m compileall .` | 编译目录下所有 `.py` 文件 |
| `python -m zipfile -l archive.zip` | 查看 zip 文件内容 |

## 与直接运行脚本的区别

### 1. `sys.path[0]` 不同

- 直接运行 `python script.py`：`sys.path[0]` 是**脚本所在目录**。
- `python -m package.module`：`sys.path[0]` 是**当前工作目录**。

这个区别会影响导入行为，尤其是包内相对导入。

### 2. 包内相对导入

包结构：

```text
mypkg/
├── __init__.py
├── a.py
└── b.py
```

`b.py` 中写：

```python
from .a import something
```

- 在项目根目录执行 `python -m mypkg.b`：✅ 正常工作。
- 直接执行 `python mypkg/b.py`：❌ 报错 `ImportError: attempted relative import with no known parent package`。

### 3. 对包执行时运行 `__main__`

`python -m mypkg` 会执行 `mypkg/__main__.py`（如果存在），相当于把包本身当作入口。

## 原理简述

`python -m` 通过标准库 `runpy` 实现：

- 先按模块名查找模块；
- 以 `__name__ == "__main__"` 的方式执行；
- 对包执行时，会加载并运行该包下的 `__main__.py`。

可以理解为：

```python
import runpy
runpy.run_module("module_name", run_name="__main__")
```

## 什么时候优先用 `python -m`

- 想确保使用**当前环境**里的模块：`python -m pip` 比直接写 `pip` 更明确。
- 运行包内模块，涉及相对导入时。
- 调用某个模块自带的功能：`python -m http.server`、`python -m json.tool` 等。
