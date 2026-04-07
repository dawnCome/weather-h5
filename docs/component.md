# 组件开发规范

## Server vs Client 边界

默认写 Server Component，只有以下情况加 `'use client'`：
- 使用 `useState` / `useEffect` / 自定义 hooks
- 绑定浏览器事件（onClick 等）
- 使用 Zustand store

```tsx
// ✅ Server Component（默认，无需声明）
export default async function UserCard({ id }: { id: string }) {
  const user = await getUser(id)
  return <div className="...">{user.name}</div>
}

// ✅ Client Component（明确声明原因）
'use client' // 需要 onClick 交互
export function LikeButton({ postId }: { postId: string }) { ... }
```

## 组件结构

```tsx
// 1. 类型定义
interface Props {
  title: string
  variant?: 'primary' | 'ghost'
  children?: React.ReactNode
}

// 2. 组件函数（具名导出为主，页面用默认导出）
export function BaseButton({ title, variant = 'primary', children }: Props) {
  // 3. hooks（Client Component 中）
  // 4. 事件处理（handle 前缀）
  // 5. 返回 JSX
}
```

## 命名规范

| 类型 | 规则 | 示例 |
|------|------|------|
| 文件名 | PascalCase | `UserCard.tsx` |
| 基础 UI | `ui/` 目录 | `ui/Button.tsx` |
| 业务组件 | 领域前缀 | `UserAvatar`, `OrderCard` |
| 页面组件 | `app/` 下 `page.tsx` | — |
| hooks | `use` 前缀 | `useCartCount` |

## Tailwind 使用

```tsx
// ✅ 工具类组合，复杂样式用 cn() 管理
import { cn } from '@/lib/utils'

<div className={cn(
  'flex items-center px-4 py-3',
  isActive && 'bg-primary text-white',
  className
)} />

// ❌ 禁止内联 style 做布局（适配相关除外）
<div style={{ marginTop: '16px' }} />
```

## Props 规范

```tsx
// ✅ interface 定义，可选项给默认值
interface CardProps {
  title: string
  description?: string
  onClick?: () => void
}

// ✅ 透传 className 供外部定制
interface Props {
  className?: string
}
```
