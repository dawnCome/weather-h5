# 路由 & 页面规范

## App Router 文件约定

```
app/
├── layout.tsx          # 根布局（必须，配置 viewport meta）
├── page.tsx            # 首页
├── loading.tsx         # 加载 UI（自动 Suspense）
├── error.tsx           # 错误边界（'use client'）
├── not-found.tsx       # 404 页面
├── (marketing)/        # 路由分组（不影响 URL）
│   └── about/page.tsx  → /about
└── [id]/               # 动态路由
    └── page.tsx        → /123
```

## 根布局

```tsx
// app/layout.tsx
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,       // H5 禁止缩放
  userScalable: false,
}

export const metadata: Metadata = {
  title: { template: '%s | AppName', default: 'AppName' },
}
```

## 页面组件规范

```tsx
// app/user/[id]/page.tsx
// ✅ 页面用默认导出；params / searchParams 类型明确
interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function UserPage({ params }: PageProps) {
  const { id } = await params
  const user = await getUser(id)   // 直接在 Server Component 取数
  return <UserDetail user={user} />
}

// ✅ 动态元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const user = await getUser(id)
  return { title: user.name }
}
```

## 导航

```tsx
// ✅ 编程式导航
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/home')
router.replace('/login')   // 不留历史（登录跳转用）

// ✅ 链接组件
import Link from 'next/link'
<Link href="/profile" prefetch={false}>个人中心</Link>

// ❌ 禁止 window.location.href（丢失 Next.js 路由状态）
```
