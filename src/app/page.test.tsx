import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home Page', () => {
  it('renders correctly', () => {
    render(<Home />)
    expect(screen.getByText(/和风天气 H5/i)).toBeInTheDocument()
    expect(screen.getByText(/开发起点/i)).toBeInTheDocument()
  })
})
