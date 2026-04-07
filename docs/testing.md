# 测试规范

## 工具栈

| 工具 | 用途 |
|------|------|
| `vitest` | 测试运行器 |
| `@testing-library/react` | 组件测试 |
| `@testing-library/user-event` | 用户交互模拟 |
| `msw` | API / fetch mock |

## 测试什么

| 类型 | 测试重点 |
|------|----------|
| UI 组件 | 渲染、交互、可访问性 |
| hooks | 状态变化、副作用、边界条件 |
| Server Actions | 成功路径、失败路径、鉴权校验 |
| Store | 初始状态、action 结果 |

## 组件测试模板

```tsx
// components/ui/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Button>提交</Button>)
      expect(screen.getByRole('button', { name: '提交' })).toBeInTheDocument()
    })

    it('applies variant class', () => {
      render(<Button variant="ghost">取消</Button>)
      expect(screen.getByRole('button')).toHaveClass('btn-ghost')
    })

    it('is disabled when loading', () => {
      render(<Button loading>提交</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick}>提交</Button>)
      await userEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledOnce()
    })

    it('does not call onClick when disabled', async () => {
      const onClick = vi.fn()
      render(<Button disabled onClick={onClick}>提交</Button>)
      await userEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })
})
```

## Hook 测试模板

```tsx
// hooks/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  it('increments count', () => {
    const { result } = renderHook(() => useCounter())
    act(() => result.current.increment())
    expect(result.current.count).toBe(1)
  })
})
```

## 覆盖率要求

| 层级 | 行覆盖率 | 分支覆盖率 |
|------|----------|------------|
| `hooks/` | ≥ 90% | ≥ 85% |
| `stores/` | ≥ 85% | ≥ 80% |
| `components/ui/` | ≥ 80% | ≥ 75% |

## 配置

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      exclude: ['src/app/**', 'src/types/**'],
      thresholds: { lines: 80, branches: 75 },
    },
  },
})
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
```
