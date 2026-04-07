# 数据请求 & API 规范

## 分层原则

```
Server Component   → 直接 async/await 取数，不经 API 路由
Server Action      → 表单提交、数据变更（mutations）
Route Handler      → 第三方回调、需要 HTTP 语义的接口
Zustand store      → 纯客户端 UI 状态（购物车、弹窗、用户偏好）
```

## Server Component 取数

```tsx
// ✅ 直接调用，Next.js 自动缓存
async function ProductPage({ params }: PageProps) {
  const { id } = await params
  const product = await db.product.findUnique({ where: { id } })
  if (!product) notFound()
  return <ProductDetail product={product} />
}
```

## Server Actions

```ts
// lib/actions/cart.ts
'use server'
import { revalidatePath } from 'next/cache'

export async function addToCart(productId: string) {
  // 1. 鉴权
  const session = await getSession()
  if (!session) throw new Error('未登录')
  // 2. 业务逻辑
  await db.cart.upsert({ ... })
  // 3. 刷新相关页面缓存
  revalidatePath('/cart')
}

// Client Component 中调用
'use client'
import { addToCart } from '@/lib/actions/cart'

function AddButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => addToCart(productId))}
    >
      {isPending ? '添加中…' : '加入购物车'}
    </button>
  )
}
```

## Route Handlers

```ts
// app/api/webhook/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  // 处理逻辑...
  return Response.json({ ok: true })
}
```

## Zustand Store

```ts
// stores/ui.ts — 只存 UI 状态，不存服务端数据
import { create } from 'zustand'

interface UIState {
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
}))

// ✅ 需要持久化时（如用户偏好）
import { persist } from 'zustand/middleware'

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({ theme: 'light', setTheme: (theme) => set({ theme }) }),
    { name: 'preference' }
  )
)
```

## 错误处理

```tsx
// ✅ Server Action 统一返回 Result 类型，不直接 throw 给客户端
type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

export async function submitOrder(payload: OrderPayload): Promise<ActionResult<Order>> {
  try {
    const order = await createOrder(payload)
    return { ok: true, data: order }
  } catch (e) {
    return { ok: false, error: '下单失败，请稍后重试' }
  }
}

// ✅ 客户端处理
const result = await submitOrder(payload)
if (!result.ok) toast.error(result.error)
```
