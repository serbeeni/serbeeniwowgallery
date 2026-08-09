import type { FilterGroup } from '../hooks/useFilters'
import { ALL_FILTER } from '../hooks/useFilters'

interface FilterMenuProps {
  groups: FilterGroup[]
  /** Everything is in — show the real filters instead of the Load All prompt. */
  ready: boolean
  isBatchLoading: boolean
  onSelect: (location: string) => void
  onLoadAll: () => void
}

/**
 * Mirrors `buildCaptionFilters()`: while posts are still coming in the menu offers a way to
 * finish loading, and only afterwards lists locations grouped into flyout submenus.
 */
export function FilterMenu({
  groups,
  ready,
  isBatchLoading,
  onSelect,
  onLoadAll,
}: FilterMenuProps) {
  if (isBatchLoading) {
    return <div className="dropdown-static-item">Please wait...</div>
  }

  if (!ready) {
    return (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onLoadAll()
        }}
      >
        Load All
      </a>
    )
  }

  return (
    <>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          onSelect(ALL_FILTER)
        }}
      >
        All
      </a>

      {groups.map((group) => (
        <div className="submenu-item" key={group.category}>
          <div className="submenu-title">
            <span>{group.category}</span>
            <span style={{ fontSize: '10px', marginLeft: '10px' }}>▶</span>
          </div>
          <div className="submenu-content">
            {group.locations.map((location) => (
              <a
                key={location}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onSelect(location)
                }}
              >
                {location.charAt(0).toUpperCase() + location.slice(1)}
              </a>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
