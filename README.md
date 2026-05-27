# Code Alignment — JSON 配置驱动的代码对齐工具

**Code Alignment** 是一款 JSON 配置驱动的 VS Code 代码对齐扩展。你在 `settings.json` 中定义对齐分隔符列表，右键菜单和快捷键自动同步，所见即所得。

支持 **Verilog / SystemVerilog** 端口对齐、一键括号对齐、自定义对齐，适用于任何编程语言。

📦 GitHub 仓库：[https://github.com/yangleiyu/codealignment-2.0.1](https://github.com/yangleiyu/codealignment-2.0.1)

---

## 快速开始

### 安装

1. 打开 VS Code，按下 `Ctrl+Shift+P` 打开命令面板
2. 输入并选择 `Extensions: Install from VSIX...`
3. 选择 `.vsix` 文件，安装完成后重启 VS Code

### 使用

1. 选中要对齐的代码行
2. **右键菜单** → 点击对齐项（如 `#5 Align by =`）
3. 或直接按快捷键 `Ctrl+Shift+1` ~ `Ctrl+Shift+9`

---

## 核心功能

### JSON 配置驱动

所有对齐分隔符在 `settings.json` 中通过 `codealignment.alignments` 配置：

```json
{
  "codealignment.alignments": [
    { "delimiter": "(" },
    { "delimiter": ";" },
    { "delimiter": "," },
    { "delimiter": "." },
    { "delimiter": "=" },
    { "delimiter": "<=", "submenu": true },
    { "delimiter": "//", "submenu": true },
    { "delimiter": "[", "submenu": true },
    { "delimiter": "]", "submenu": true },
    { "delimiter": "reg", "submenu": true },
    { "delimiter": "wire", "submenu": true },
    { "delimiter": "input", "submenu": true },
    { "delimiter": "output", "submenu": true }
  ]
}
```

**修改即生效**：编辑 settings.json 后，右键菜单和快捷键自动同步，无需重启。

### 一键括号对齐

当配置 `{ "delimiter": "(" }` 时，自动同时对 `(` 和 `)` 进行对齐，一次点击完成括号配对。

### 右键菜单

右键菜单每一项都显示 **序号 + 分隔符名称**（如 `#1 Align by ( )`、`#5 Align by =`），序号与 `settings.json` 中的位置一一对应。当你新增自定义分隔符时，即使菜单无法显示真实符号名称，也能靠序号快速找到。

设为 `submenu: true` 的项会折叠到 **More Alignments ▶** 子菜单中，保持主菜单简洁。

**默认布局**：`#1 ( )` ~ `#5 =` 五项在主菜单，其余在子菜单。

### 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+1` | 对齐 `#1`（默认 `(`） |
| `Ctrl+Shift+2` | 对齐 `#2`（默认 `;`） |
| `Ctrl+Shift+3` | 对齐 `#3`（默认 `,`） |
| `Ctrl+Shift+4` | 对齐 `#4`（默认 `.`） |
| `Ctrl+Shift+5` | 对齐 `#5`（默认 `=`） |
| `Ctrl+Shift+6` | 对齐 `#6`（默认 `<=`） |
| `Ctrl+Shift+7` | 对齐 `#7`（默认 `//`） |
| `Ctrl+Shift+8` | 对齐 `#8`（默认 `[`） |
| `Ctrl+Shift+9` | 对齐 `#9`（默认 `]`） |
| `Ctrl+Shift+=` | 自定义对齐（输入任意分隔符） |

前 9 项自动绑定到 `Ctrl+Shift+1~9`，与 settings.json 中的顺序一一对应。

### 自定义对齐

点击右键菜单的 **Align by Custom Delimiter...** 或按 `Ctrl+Shift+=`，输入任意分隔符字符串进行对齐。

### 恢复默认配置

右键菜单底部 **Configure Alignments...** → 修改 `codealignment.alignments` 数组。
如需恢复默认，使用 **Restore Default Alignments**（需确认）。

---

## 对齐示例

### 按等号对齐

```javascript
var name         = "foo";
var anotherName  = "bar";
var someVariable = "baz";
```

### 按逗号对齐

```javascript
int id, name, age;
int count, total, price;
```

### 按句点对齐（对象属性访问链）

```javascript
someObject
    .Property1
    .AnotherProperty
    .FinalProperty;
```

### 按 `<=` 对齐（Verilog 非阻塞赋值）

```verilog
a     <= a_next;
b     <= b_next;
sum   <= sum_next;
valid <= valid_next;
```

### 按 `//` 对齐（行内注释）

```verilog
wire clk;   // 系统时钟
wire rst_n; // 异步复位，低有效
wire start; // 启动信号
wire done;  // 完成标志
```

### 按端口声明关键词对齐

```verilog
input  wire        clk,
input  wire        rst_n,
output reg   [7:0] data_out,
output wire        valid,
inout  wire [15:0] bus_data
```

---

## 配置参考

### codealignment.alignments

对齐分隔符列表，最多 15 项。每项包含：

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `delimiter` | string | - | 对齐分隔符字符串。设为 `(` 时同时对齐 `)` |
| `submenu` | boolean | false | `true` 时该项显示在 "More Alignments" 子菜单中，保持主菜单简洁 |

前 9 项自动绑定快捷键 `Ctrl+Shift+1~9`。

### 文件类型识别

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `codealignment.xmlTypes` | XML 类文件扩展名 | `.xml`, `.html`, `.xaml` 等 |
| `codealignment.vlTypes` | Verilog/SV 文件扩展名 | `.v`, `.sv`, `.vh`, `.svh` 等 |

不同文件类型使用不同的智能范围检测策略（通用、XML、Verilog）。

### 其他设置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `codealignment.useIdeTabSettings` | boolean | true | 对齐时遵循 VS Code Tab 设置 |
| `codealignment.scopeSelectorLineValues` | string | "" | 空白行匹配值（空格分隔） |
| `codealignment.scopeSelectorLineEnds` | string | "" | 行尾匹配模式（空格分隔） |

---

## 适用场景

- **任何编程语言** — JavaScript、TypeScript、Python、Java、C#、Verilog/SV 等
- **批量变量声明** — 等号、冒号对齐
- **逗号分隔列表** — 函数参数、声明语句对齐
- **对象属性链** — 句点 `.` 对齐
- **端口声明** — input / output 对齐（Verilog/SV）
- **赋值语句** — `<=`、`=` 对齐
- **注释对齐** — `//` 对齐
- **符号对齐** — `[`、`]`、`;` 对齐
- **自定义场景** — 任何重复模式的列对齐

---

## 常见问题

### 如何修改对齐项？

打开 settings.json（`Ctrl+Shift+P` → `Preferences: Open User Settings (JSON)`），编辑 `codealignment.alignments` 数组。

### 如何恢复默认？

右键菜单 → **Restore Default Alignments**，确认后恢复为 13 个默认分隔符。

### 快捷键与其他扩展冲突？

`Ctrl+K Ctrl+S` 打开键盘快捷方式面板，搜索 `codealignment` 重新绑定。

### 最多能配置几项？

最多 15 项。前 9 项自动绑定快捷键。
