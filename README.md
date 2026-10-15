# 🏠 Smart Mortgage Calculator (智能房贷精算与还款决策推演系统)

一款专为中国个人房贷借款人打造的高颜值、专业级房贷计算器与还款决策推演系统。支持商业贷款、公积金贷款及组合贷款，具备 360 期逐期还款明细导出、等额本息与等额本金深度 PK、提前还款利息节省推演及银行标准申请书模板生成。

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

---

## ✨ 核心功能亮点

### 1. 📊 房贷计算 (Mortgage Calculator)
- **多类型贷款覆盖**：全面支持商业贷款、公积金贷款以及组合贷款模式。
- **双向计算基准**：支持「按贷款额度」直接输入，或「按房屋总价 + 首付比例 (20%~50%)」倒推贷款额。
- **最新 LPR 利率联动**：内置人民银行 5 年期以上 LPR 基准（3.45%），支持快捷基点调整（减40BP、减20BP、基准LPR、加30BP）或自定义利率。
- **实时高光月供看板**：首月月供、每月本息占比条（本金 vs 利息）、还款总成本即刻响应。

### 2. 📅 还款明细总表 (Repayment Schedule)
- **360 期全生命周期摊销**：清晰展现每一期的还款日期、月供金额、当期本金、当期利息及剩余待还本金。
- **还款演变与进度滑块**：支持自由滑动调整当前已还期数，实时同步已还本金、累计付息及剩余本金。
- **年份周期检索**：横向按年份快速筛选，实时统计该年度累计应还本息、本金合计与利息合计。
- **末期反转特征探查**：一键切换查看末期（第 350-360 期）本息结构反转（利息仅几十元，月供以本金为主）。
- **专业导出**：
  - 📥 **导出 Excel**：生成并下载兼容 Excel 的标准 `.csv` 摊销全表明细。
  - 🖨️ **生成 PDF 清单**：支持浏览器标准打印排版，一键保存为 PDF。

### 3. ⚖️ 方案对比与平衡拐点 (Plan Comparison)
- **利息差额精准核算**：一目了然展现等额本金相对等额本息总共节省的利息金额（如省 ¥77,916 元），并折算为相当于少还多少个月月供。
- **双栏直观 PK**：针对等额本息（平稳型）与等额本金（推荐省息）从首月月供、递减规律、累计成本到适合人群画像进行深度对比。
- **月供走向与平衡拐点图**：SVG 趋势图直观标示两条月供曲线打平的平衡点（第 135 期 / 约 11 年），辅助判断换算周期。
- **测测哪种方式更适合你？**：交互式财务偏好小测试（未来收入预期 + 资金流动性偏好），动态测算并推荐适配度（匹配度 92%~94%）。

### 4. 🐷 提前还款推演实验室 (Early Repayment)
- **原贷款档案联动**：自动同步原贷款本金、利率与已还期数，精确核算当前剩余待还本金。
- **双模式模拟**：「部分提前还款」与「一次性全部结清」。
- **双目标推演**：
  - **缩短还款年限（月供不变）**：测算能够提前多少年还清（如提前 8 年 6 个月），实现省息最大化。
  - **减少每月月供（年限不变）**：测算每月可减轻多少月供负担，释放生活现金流。
- **违约金与手续费核算**：支持无违约金（满 3 年免收）与 1% 违约金情景自由切换。
- **还款决策智囊与避坑指南**：
  - 公积金或历史极低存量利率为何无需急着还？
  - 注意“1/3 本金期”与“1/2 本息期”的收益递减定律。
- **银行标准示范文本**：内置各商业银行通用的《个人提前还款申请书》模板，支持一键填报、一键复制全文与直接打印。

### 5. 🏙️ 全国主流城市房贷利率参考库
- 顶部导航一键查阅全国基准、北京、上海、深圳、广州、杭州、成都等主流一二线城市最新的首套房、二套房执行利率及公积金标准。
- 点击卡片即可将对应城市的最新利率直接一键应用到计算器中。

---

## 🛠️ 技术栈

- **Core**：React 19, TypeScript
- **Build Tool**：Vite 6+
- **Styling**：Tailwind CSS 4
- **Icons**：Google Material Symbols Outlined
- **CI/CD**：GitHub Actions（自动化构建与部署至 GitHub Pages）

---

## 🚀 本地开发与运行

### 1. 克隆仓库
```bash
git clone https://github.com/stonebirds/Smart-Mortgage-Calculator.git
cd Smart-Mortgage-Calculator
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可预览。

### 4. 打包构建
```bash
npm run build
```
打包产物将输出至 `dist` 目录。

---

## 🌐 部署说明

本项目已内置 `.github/workflows/deploy.yml` 自动化工作流。

### 启用 GitHub Pages 免费部署：
1. 打开 GitHub 仓库设置：`Settings` -> `Pages`。
2. 在 **Build and deployment** 下方的 **Source** 选择 **GitHub Actions**。
3. 推送代码至 `main` 分支后，GitHub 将自动完成编译与发布。
4. 默认在线访问地址：
   `https://<你的GitHub用户名>.github.io/<你的仓库名>/`

---

## 📄 开源协议

本项目基于 [Apache License 2.0](LICENSE) 协议开源。
