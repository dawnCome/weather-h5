# Next.js H5 开发规范

> 技术栈：Next.js 16 · TypeScript · Tailwind CSS · Zustand · viewport 适配

所有代码生成、修改、重构均须遵循本规范。子规范见 `docs/` 目录。

---

## 技术栈速查

| 层级 | 方案                                    |
| ---- | --------------------------------------- |
| 框架 | Next.js 16 App Router                   |
| 语言 | TypeScript（strict 模式）               |
| 样式 | Tailwind CSS v4                         |
| 状态 | Zustand                                 |
| 请求 | fetch + Server Actions / Route Handlers |
| 测试 | Vitest + @testing-library/react         |
| 适配 | viewport vw/vh                          |

---

## 规范索引

- [组件开发](./docs/component.md) — 组件结构、props、命名、Server/Client 边界
- [路由 & 页面](./docs/routing.md) — App Router 约定、布局、元数据
- [数据请求 & API](./docs/data.md) — Server Actions、Route Handlers、Zustand store
- [测试](./docs/testing.md) — 测试工具栈、模板、覆盖率
- [H5 适配](./docs/h5.md) — viewport 方案、Tailwind 配置、安全区域

---

## 核心禁止项（全局）

```
❌ 禁止 any 类型（含 as any）
❌ 禁止 @ts-ignore（无注释说明时）
❌ 禁止在 Server Component 中使用 useState / useEffect
❌ 禁止裸调 fetch，不处理 loading / error 状态
❌ 禁止硬编码 px 尺寸做移动端适配（用 vw 或 Tailwind 工具类）
❌ 禁止生成无对应测试的新组件（UI 基础组件除外）
```

---

## 目录结构

```
src/
├── app/                  # App Router 页面与布局
│   ├── layout.tsx        # 根布局（viewport meta 在此配置）
│   ├── (home)/           # 路由分组
│   └── api/              # Route Handlers
├── components/
│   ├── ui/               # 基础 UI 组件（无业务逻辑）
│   └── features/         # 业务组件（按领域子目录）
├── stores/               # Zustand stores
├── lib/                  # 工具函数、fetch 封装
├── hooks/                # 自定义 hooks
├── types/                # 全局类型定义
└── test/
    └── setup.ts          # 测试全局配置
```
