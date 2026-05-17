# Code Alignment — VSCode 代码对齐扩展

**Code Alignment** 是一款通过对齐分隔符来美化代码格式的 VSCode 扩展，能够显著提升代码的可读性。支持 **Verilog / SystemVerilog** 硬件描述语言的原生对齐。

本项目基于原 Notepad++ / Visual Studio 版 Code Alignment 插件完整移植。

> 官方网站：[http://www.codealignment.com](http://www.codealignment.com)

---

## 安装方式

### 方式一：从 VSIX 包安装（推荐）

1. 打开 VSCode，按下 `Ctrl+Shift+P` 打开命令面板
2. 输入并选择 `Extensions: Install from VSIX...`
3. 在文件选择框中找到 `.vsix` 文件，点击确定
4. 安装完成后重启 VSCode 即可生效

### 方式二：从源码编译安装

```bash
cd vscode-extension
npm install
npm run compile
npx vsce package
```

### 方式三：从 VSCode 扩展市场安装

扩展面板 (`Ctrl+Shift+X`) 中搜索 "Code Alignment"，点击安装。

---

## 兼容性

- VSCode 1.85.0 及以上版本均可正常运行
- 已在 VSCode 1.97.x（最新稳定版）、1.93.x、1.85.x 上通过验证

---

## 什么是代码对齐

代码对齐（Code Alignment）是一种通过格式化代码使其在垂直方向上按列排布来提升可读性的实践。

**对齐前：**

```javascript
var name = "foo";
var anotherName = "bar";
var someVariable = "baz";
```

**执行 "按等号对齐" 后：**

```javascript
var name         = "foo";
var anotherName  = "bar";
var someVariable = "baz";
```

---

## 核心功能

### 对齐命令一览

| 命令 | 功能 | 默认快捷键 |
|------|------|-----------|
| **Align by...** | 输入自定义分隔符字符串进行对齐 | `Ctrl+Shift+=` |
| **Align by equals** | 按单个等号 `=` 对齐 | `Ctrl+Shift+1` |
| **Align by equals equals** | 按双等号 `==` 对齐 | `Ctrl+Shift+2` |
| **Align by m_** | 按成员变量前缀 `m_` 对齐 | `Ctrl+Shift+3` |
| **Align by quote** | 按双引号 `"` 对齐 | `Ctrl+Shift+4` |
| **Align by period** | 按句点 `.` 对齐 | `Ctrl+Shift+5` |
| **Align by space** | 按空格对齐 | `Ctrl+Shift+6` |
| **Align from caret** | 从光标位置开始对齐 | `Ctrl+Shift+7` |
| **Align by key** | 按键对齐模式（交互式快捷对齐） | `Ctrl+=` |

### 功能入口

- **命令面板** → `Ctrl+Shift+P` → 输入 "Align"
- **右键菜单** → 展开 "Code Alignment" 菜单组（含 "Verilog/SV Align" 子菜单）
- **状态栏按钮** → 编辑器底部状态栏右侧 "Align" 按钮
- **键盘快捷键** → 使用上表默认快捷键

### 更多对齐示例

按 `.` 对齐（常用于对象属性访问链）：

```javascript
someObject
    .Property1
    .AnotherProperty
    .FinalProperty;
```

按 `m_` 对齐（常用于类成员变量声明）：

```csharp
private string m_name;
private int    m_age;
private bool   m_isActive;
```

按 `=>` 对齐（Lambda 表达式 / 箭头函数）：

```javascript
const add      = (a, b) => a + b;
const multiply = (a, b) => a * b;
const divide   = (a, b) => a / b;
```

---

## Align by key 按键对齐模式详解

按下 `Ctrl+=` 进入按键对齐模式：

1. 弹出快捷选择面板，列出已配置的所有快捷键
2. 输入或选择对应键位字符即可执行对齐操作
3. 每次对齐后面板**保持打开**，支持链式连续对齐
4. 点击 **Align from Caret** 按钮可从光标位置启动对齐
5. 按 `Esc` 或点击 **Exit** 退出

### 对齐链操作示例

```javascript
var name = "foo";
var anotherName = "bar";
var someVariable = "baz";
```

1. 选中代码区域
2. 按下 `Ctrl+=` 进入按键对齐模式
3. 输入 `=` → 等号对齐完成
4. 继续输入 `"` → 引号对齐也完成
5. `Esc` 退出

最终效果：

```javascript
var name         = "foo";
var anotherName  = "bar";
var someVariable = "baz";
```

---

## Verilog / SystemVerilog 对齐支持（v1.1 新增）

本扩展新增了对 **Verilog** 和 **SystemVerilog** 硬件描述语言的原生对齐支持，适配数字 IC 设计领域的主流编码规范。

### Verilog/SV 专用对齐命令

| 命令 | 功能 |
|------|------|
| **VL: Align blocking assigns (=, add space)** | 按阻塞赋值 `=` 对齐，自动添加空格 |
| **VL: Align by non-blocking assign (<=)** | 按非阻塞赋值 `<=` 对齐 |
| **VL: Align port declarations (input/output)** | 按端口声明关键字对齐 |
| **VL: Align signal bit-width ([7:0])** | 按位宽声明的 `[` 对齐 |
| **VL: Align module instances (.port)** | 按模块实例化 `.port(` 对齐 |
| **VL: Align assign statements** | 按 `assign` 关键字对齐 |
| **VL: Align case items (:)** | 按 case 分支冒号对齐 |
| **VL: Align inline comments (//)** | 按行内注释 `//` 对齐 |

### 智能块边界检测

Verilog/SV 文件中，扩展自动识别以下语法块边界：

- `module` / `endmodule` — 模块声明边界
- `always` / `always_comb` / `always_ff` — 过程块边界
- `begin` / `end` — 顺序块边界
- `generate` / `endgenerate` — 生成块边界
- `interface` / `endinterface` — 接口声明边界
- `package` / `endpackage` — 包声明边界
- `fork` / `join` — 并行块边界

### 对齐示例

**端口声明对齐：**

```verilog
// 对齐前
input wire        clk,
input wire        rst_n,
output reg [7:0]  data_out,
output wire       valid,
inout wire [15:0] bus_data

// 对齐后
input  wire        clk,
input  wire        rst_n,
output reg   [7:0] data_out,
output wire        valid,
inout  wire [15:0] bus_data
```

**信号位宽声明对齐：**

```verilog
// 对齐前
reg [7:0]   addr;
reg [31:0]  data;
reg [1:0]   state;
reg [15:0]  counter;

// 对齐后
reg [7:0]  addr;
reg [31:0] data;
reg [1:0]  state;
reg [15:0] counter;
```

**模块实例化对齐：**

```verilog
// 对齐前
adder u_adder (
    .clk(clk),
    .rst_n(rst_n),
    .a(a_in),
    .b(b_in),
    .sum(sum_out)
);

// 对齐后
adder u_adder (
    .clk  (clk),
    .rst_n(rst_n),
    .a    (a_in),
    .b    (b_in),
    .sum  (sum_out)
);
```

**阻塞与非阻塞赋值对齐：**

```verilog
// always_comb — 阻塞赋值
a_next     = a;
b_next     = b;
sum_next   = a + b;
valid_next = 1'b1;

// always_ff — 非阻塞赋值
a     <= a_next;
b     <= b_next;
sum   <= sum_next;
valid <= valid_next;
```

**行内注释对齐：**

```verilog
wire clk;   // 系统时钟
wire rst_n; // 异步复位，低有效
wire start; // 启动信号
wire done;  // 完成标志
```

### 使用方式

- **右键菜单** → 展开 "Verilog/SV Align" 子菜单
- **命令面板** → `Ctrl+Shift+P` → 输入 "VL:"
- **Align by key 按键模式** → 在设置面板中配置常用对齐到按键

### Verilog/SV 文件类型配置

在选项面板的 "Auto Selection" 区域编辑文件扩展名：

默认支持：`.v` | `.sv` | `.vh` | `.svh` | `.vhd` | `.svp`

---

## 选项设置

### 打开设置面板

- 命令面板 → `Code Alignment: Options`
- 右键菜单中点击对应选项

### 通用设置

- **Use IDE tab settings** — 对齐时遵循 VSCode 的 Tab 设置
- **Clear most recently used alignment list** — 清空历史记录

### 键盘快捷键

配置 "Align by key" 模式中每个按键的对齐行为：

| 配置项 | 说明 |
|--------|------|
| Key | 触发对齐的按键 |
| Alignment | 该按键对应的分隔符 |
| Language | 限定语言（留空=全部） |
| From Caret | 从光标位置开始查找 |
| Is Regex | 作为正则表达式处理 |
| Add Space | 对齐位置前自动添加空格 |

**恢复默认快捷键：**

| 按键 | 对齐内容 |
|------|---------|
| = | = |
| 空格 | （空格） |
| . | . |
| " | " |
| M | m_ |

### 自动选区设置

- **XML File Types** — 每行一个扩展名，使用 XML 作用域选择器
- **Verilog/SV File Types** — 每行一个扩展名，使用 VL 作用域选择器
- **Scope Selector Line Values** — 空格分隔的空白行匹配值
- **Scope Selector Line Ends** — 空格分隔的行尾匹配模式

---

## VSCode 设置参考（settings.json）

```json
{
  "codealignment.shortcuts": [
    {
      "value": 187,
      "alignment": "=",
      "language": null,
      "alignFromCaret": false,
      "useRegex": false,
      "addSpace": false
    }
  ],
  "codealignment.xmlTypes": [".xml", ".html", ".xaml"],
  "codealignment.vlTypes": [".v", ".sv", ".vh", ".svh"],
  "codealignment.scopeSelectorLineValues": "",
  "codealignment.scopeSelectorLineEnds": "",
  "codealignment.useIdeTabSettings": true
}
```

---

## 常见问题

### 快捷键与其他扩展冲突怎么办？
`Ctrl+K Ctrl+S` 打开键盘快捷方式面板，搜索 "codealignment" 重新绑定。

### 如何只对选中的行进行对齐？
鼠标或键盘选中需要对齐的行后执行对齐命令。未选中时自动智能确定范围。

### 正则表达式对齐怎么用？
在 "Align by..." 对话框中切换到 Regex 模式，支持命名分组：
- `(?<compare>...)` — 计算对齐位置的参考点
- `(?<insert>...)` — 空格实际插入的位置

---

## 技术架构

```
src/
├── business/                    # 核心业务逻辑
│   ├── Alignment.ts            # 对齐算法主类
│   ├── Key.ts                  # 按键枚举定义
│   ├── KeyShortcut.ts          # 快捷键数据模型
│   ├── LineDetails.ts          # 行细节计算
│   ├── Options.ts              # 设置管理
│   ├── delimiterFinders/       # 分隔符查找器
│   ├── interfaces/             # 接口定义
│   └── selectors/              # 作用域选择器
├── AlignFunctions.ts           # 对齐功能协调器
├── VSCodeDocument.ts           # VSCode 编辑器适配层
└── extension.ts                # 扩展入口与 UI 层
```

---

## 许可证

与原 Code Alignment 项目使用相同的开源许可证。


