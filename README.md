# 羽练 Badminton Coach

面向中国业余羽毛球爱好者的智能训练规划与执行打卡系统。

## 产品特色

- **可解释的科学规则引擎**：基于正统羽毛球运动生物力学、供能系统与体能超量恢复原理，根据用户水平（初学者/业余进阶/熟练球友）、专项目标（基础技术/步法/体能/进攻/防守/综合）、场地（球场/居家/健身房）及训练时长（30/45/60/90分钟）科学排布周课表。
- **纯前端与零后端依赖**：所有配置、周课表与打卡日志均保存在浏览器 `localStorage` 中，刷新页面依然保存，离线可用。
- **真实训练打卡闭环**：包含单项勾选任务、动作要领指导、内置分段/间歇计时器与 Web Audio 提示音、RPE 主观疲劳评分（1-10分刻度）及高频技术失误复盘。
- **真实数据动态看板**：根据实际打卡记录动态计算累计次数、累计时长、本周执行率、最近7天挥拍时长柱状图及高频专项分布，杜绝虚假固定假数字。

---

## 页面结构

1. **首页概览 (`HomeView`)**：展示产品名称、欢迎语、训练画像摘要、今日训练焦点卡片、本周七天进度条以及核心指标快报。
2. **本周计划 (`WeeklyPlanView`)**：周一至周日全景卡片，拆解热身、技术、步法体能与拉伸四大阶段，清晰标注休息日与训练日。
3. **训练打卡 (`WorkoutDetailView`)**：单日深度执行页面，提供动作要领展开、多功能计时秒表、任务勾选和打卡反思表单。
4. **数据看板 (`StatsHistoryView`)**：最近7天时长图表、训练主题分布、历史记录归档与详情弹窗、记录删除。
5. **画像设置 (`ProfileSettingsView`)**：修改水平、目标、天数、时长和场地，重新生成周课表（带二次确认），提供示例数据载入与清空重置。

---

## 项目文件结构

```
/
├── index.html                    # HTML 入口，配置中文字体与元数据
├── metadata.json                 # 应用元数据
├── package.json                  # 依赖与脚本
├── src/
│   ├── App.tsx                   # 顶层状态与全局页面路由调度
│   ├── main.tsx                  # React 19 应用入口
│   ├── index.css                 # Tailwind CSS 4 及等宽数字样式
│   ├── types/
│   │   └── index.ts              # 训练画像、阶段动作、课表与打卡记录类型定义
│   ├── data/
│   │   └── badmintonKnowledge.ts # 专业羽毛球动作库、场地限制规则与常见失误标签
│   ├── utils/
│   │   ├── planGenerator.ts      # 科学周计划确定性生成引擎
│   │   ├── storage.ts            # localStorage 读写、示例数据及状态重置工具
│   │   └── sound.ts              # Web Audio API 计时器提示音与打卡成功音效
│   └── components/
│       ├── Navbar.tsx            # 顶部导航与移动端沉底式标签栏
│       ├── HomeView.tsx          # 首页与今日焦点
│       ├── WeeklyPlanView.tsx    # 一周计划详情与阶段分解
│       ├── WorkoutDetailView.tsx # 单次训练执行、计时器与打卡表单
│       ├── StatsHistoryView.tsx  # 数据看板、近7天图表与历史记录
│       ├── ProfileSettingsView.tsx # 训练画像设置与数据重置
│       ├── TimerWidget.tsx       # 倒计时/间歇/秒表训练计时器
│       └── ConfirmModal.tsx      # 二次确认安全弹窗组件
```

---

## 运行方式与部署指南

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器 (默认端口 3000)
npm run dev

# 3. 构建生产包
npm run build

# 4. 代码类型与语法检查
npm run lint
```

### 部署指南

- 本项目为无服务端依赖的纯静态 SPA（Single Page Application）。
- 运行 `npm run build` 后会生成 `dist/` 文件夹。
- 可直接部署至任何静态托管平台（如 Vercel, Cloudflare Pages, GitHub Pages, Nginx 或 Google Cloud Run / Storage）。

---

## 已知限制与后续规划

1. **多设备同步**：当前第一版遵循轻量要求使用 `localStorage`，更换不同设备或清理浏览器缓存后数据无法跨设备同步。
2. **打卡视频/照片上传**：第一版侧重文字与标签失误复盘，未来版本可结合 IndexedDB 支持短视频或击球照片记录。
3. **未通过测试项**：无（所有 8 项核心验收标准已全部通过静态检查与构建验证）。
