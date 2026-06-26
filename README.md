# 高考志愿填报助手

基于 **Vue 3 + TypeScript + Vite** 构建的轻量级高考志愿推荐工具。输入分数后，系统根据投档分自动将院校划分为「冲一冲 / 稳一稳 / 保一保」三档，并支持省份、城市、院校层次等多维筛选。

> 数据仅供参考，实际以院校官方发布为准。

---

## 功能特性

| 特性 | 说明 |
|------|------|
| **分数智能推荐** | 输入高考分数，自动计算 ±20 分差值，匹配冲/稳/保三档院校 |
| **多维筛选** | 省份、城市、院校层次、院校性质、招生类型、选科要求、院校特色 |
| **省内省外分离** | 选择考生所在省份后，自动区分省内 / 省外院校 |
| **智能分组展示** | 每档默认展示 3 所，结果按推荐优先级排序 |
| **多数据源** | 自动识别 CSV / MD / JSON / XLSX 格式，命中即停 |
| **响应式布局** | 适配桌面端与移动端 |
| **实时加载状态** | 显示加载进度条、数据源信息、院校数量统计 |

---

## 技术栈

| 分类 | 技术 |
|------|------|
| 核心框架 | Vue 3 (Composition API + `<script setup>`) |
| 类型系统 | TypeScript |
| 构建工具 | Vite 5 |
| UI 组件 | Element Plus |
| 原子化 CSS | UnoCSS |
| 样式预处理 | SCSS |
| Excel 解析 | xlsx |
| 图表 / 表格 | vxe-table |

---

## 项目结构

```
graduate_school_query/
├── public/data/               # 院校数据文件（多格式）
│   ├── schools.csv           # 主数据源（CSV）
│   ├── schools.json
│   ├── schools.md
│   └── schools.xls
├── src/
│   ├── main.ts               # 应用入口
│   ├── App.vue               # 主页面组件
│   ├── components/
│   │   └── SchoolRow.vue     # 院校卡片组件
│   ├── hooks/
│   │   └── useSchoolQuery.ts # 查询逻辑 + 状态管理
│   ├── types/
│   │   └── school.ts         # TypeScript 类型定义 + 枚举常量
│   └── utils/
│       └── excelLoader.ts    # 多格式数据加载工具
├── scripts/                  # 辅助脚本
│   ├── gen-schools.mjs       # 生成模拟数据
│   ├── gen-schools-xls.mjs   # 生成 Excel 数据
│   ├── gen-data-sources.mjs  # 批量生成多格式数据
│   └── screenshot-*.mjs     # 截图工具
├── index.html
├── vite.config.ts
├── uno.config.ts
├── tsconfig.json
└── package.json
```

---

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173`（端口可能被占用，自动切换到 5174 等）。

### 构建生产版本

```bash
npm run build
```

输出到 `dist/` 目录，可直接部署至任意静态托管平台。

### 编译静态文件服务器（可选）

```bash
go build -o dist/serve.exe server.go
```

生成 `dist/serve.exe`，双击即可启动本地静态服务，访问 http://localhost:8080。

---

## 数据格式说明

### 数据源优先级（应用按此顺序查找，命中即停）

1. `/data/schools.csv`
2. `/data/schools.md`
3. `/data/schools.json`
4. `/data/schools.xlsx`
5. `/data/schools.xls`

### CSV / JSON 字段说明

| 字段名 | 必填 | 说明 |
|--------|------|------|
| 学校标识码 | 是 | 教育部 5 位国标代码 |
| 学校名称 | 是 | 完整校名 |
| 投档分数 | 否 | 留空不参与匹配 |
| 最低位次 | 否 | 投档最低位次 |
| 省份 | 是 | 院校所在省份 |
| 城市 | 是 | 院校所在城市 |
| 院校层次 | 是 | 本科 / 专科(高职) |
| 院校性质 | 是 | 公办 / 民办 / 中外合作办学 |
| 院校特色 | 否 | 多选用 `\|` 分隔（985 / 211 / 双一流 / 省重点等） |
| 招生类型 | 是 | 普通类 / 中外合作办学 / 校企合作 / 国家专项 等 |
| 选科要求 | 是 | 不限 / 物理 / 历史 等 |
| 主管部门 | 否 | 教育部 / 各省教育厅 等 |

> 如需更新数据，只需替换 `public/data/` 下的数据文件即可，无需修改代码。

---

## 数据更新

如需使用最新院校数据，可通过以下方式获取并放置到 `public/data/` 目录：

1. 从省教育考试院官网下载当年投档线数据
2. 使用 `scripts/` 下的辅助脚本进行格式转换
3. 确保 CSV 第一行为标准表头（参考上方字段说明）

---

## 推荐算法说明

系统以用户输入分数为基准，结合院校投档分数计算差值：

- **冲一冲**：院校投档分 - 用户分数 > 0（即院校分数高于用户分数，有一定挑战）
- **稳一稳**：|院校投档分 - 用户分数| ≤ 5 分（基本持平，最稳妥的选择）
- **保一保**：院校投档分 - 用户分数 < -5 分（有较大分数余量）

> 阈值可通过修改 `useSchoolQuery.ts` 中的 `BINS` 配置常量进行调整。

---

## 依赖说明

| 依赖 | 版本 | 用途 |
|------|------|------|
| vue | ^3.4.0 | 核心框架 |
| element-plus | ^2.7.0 | UI 组件库 |
| xlsx | ^0.18.5 | Excel 文件解析 |
| vite | ^5.2.0 | 构建工具 |
| unocss | ^0.61.0 | 原子化 CSS |
| sass | ^1.77.0 | SCSS 预处理 |
| typescript | ^5.4.0 | 类型系统 |
| @element-plus/icons-vue | ^2.3.1 | Element Plus 图标 |

---

## License

MIT
