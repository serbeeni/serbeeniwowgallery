import type { ReactNode } from 'react'

interface DropdownProps {
  label: string
  open: boolean
  onToggle: () => void
  children: ReactNode
  /** Rendered inside the button wrapper — used for the floating quest marker. */
  decoration?: ReactNode
}

/** A "Menu ▼" style button with its dropdown panel, both inside one `.menu-container`. */
export function Dropdown({
  label,
  open,
  onToggle,
  children,
  decoration,
}: DropdownProps) {
  return (
    <div className="menu-container">
      <button className="toggle-btn" onClick={onToggle}>
        {label} ▼
      </button>
      {decoration}
      <div
        className="dropdown-content"
        style={{ display: open ? 'block' : 'none' }}
      >
        {children}
      </div>
    </div>
  )
}
