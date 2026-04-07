import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home Page', () => {
  it('renders correctly', () => {
    render(<Home />)
    expect(screen.getByText(/气象异动预警/i)).toBeInTheDocument()
    expect(screen.getByText(/开启\/更新预警/i)).toBeInTheDocument()
  })
})
