import { QUEST_ICON_URL } from '../config/assets'
import type { FilterGroup } from '../hooks/useFilters'
import type { MenuId } from '../hooks/useMenus'
import type { QuestState } from '../hooks/useQuestIcon'
import type { PageLink, ViewMode } from '../types'
import { Dropdown } from './Dropdown'
import { FilterMenu } from './FilterMenu'

interface ControlsBarProps {
  pages: PageLink[]
  openMenu: MenuId | null
  onToggleMenu: (id: MenuId) => void
  onCloseMenus: () => void
  quest: QuestState

  filterGroups: FilterGroup[]
  filtersReady: boolean
  onSelectFilter: (location: string) => void

  isBatchLoading: boolean
  allLoaded: boolean
  progress: number
  progressActive: boolean
  onLoadAll: () => void

  sortOldestFirst: boolean
  onToggleSort: () => void

  viewMode: ViewMode
  onToggleLayout: () => void
}

export function ControlsBar({
  pages,
  openMenu,
  onToggleMenu,
  onCloseMenus,
  quest,
  filterGroups,
  filtersReady,
  onSelectFilter,
  isBatchLoading,
  allLoaded,
  progress,
  progressActive,
  onLoadAll,
  sortOldestFirst,
  onToggleSort,
  viewMode,
  onToggleLayout,
}: ControlsBarProps) {
  const selectFilter = (location: string) => {
    onSelectFilter(location)
    onCloseMenus()
  }

  const isGuide = (label: string) => label.trim().toLowerCase().includes('guide')

  return (
    <div className="controls-wrapper">
      <Dropdown
        label="Menu"
        open={openMenu === 'main'}
        onToggle={() => {
          onToggleMenu('main')
          quest.onMenuOpened()
        }}
        decoration={
          quest.showFloatingIcon ? (
            <img
              src={QUEST_ICON_URL}
              className="quest-icon-above"
              id="wowFloatingQuestIcon"
              alt=""
            />
          ) : undefined
        }
      >
        <a href="/">Home</a>
        {pages.map((page) => (
          <a
            key={page.url}
            href={page.url}
            className={
              isGuide(page.label) && quest.showInlineIcon
                ? 'has-quest-cursor'
                : undefined
            }
            onClick={() => {
              if (isGuide(page.label)) quest.onGuideClicked()
            }}
          >
            {page.label}
            {isGuide(page.label) && quest.showInlineIcon && (
              <img
                src={QUEST_ICON_URL}
                className="quest-icon-inline"
                alt=""
              />
            )}
          </a>
        ))}
      </Dropdown>

      <Dropdown
        label="Filter"
        open={openMenu === 'filter'}
        onToggle={() => onToggleMenu('filter')}
      >
        <FilterMenu
          groups={filterGroups}
          ready={filtersReady}
          isBatchLoading={isBatchLoading}
          onSelect={selectFilter}
          onLoadAll={onLoadAll}
        />
      </Dropdown>

      <div className="spacer" style={{ flexGrow: 1 }} />

      {/* Revealed only once everything is loaded, as the theme's observer did. */}
      {allLoaded && (
        <button
          className="toggle-btn"
          id="standaloneSortBtn"
          onClick={onToggleSort}
        >
          {sortOldestFirst ? 'Oldest First' : 'Newest First'}
        </button>
      )}

      <div className="load-btn-wrapper">
        <button
          className="toggle-btn"
          id="loadAllBtn"
          onClick={onLoadAll}
          disabled={allLoaded || isBatchLoading}
        >
          <span id="loadAllBtnText">
            {allLoaded ? 'ALL LOADED' : isBatchLoading ? 'LOADING...' : 'Load All'}
          </span>
        </button>
        <div
          className={`load-bar-track${progressActive ? ' active' : ''}`}
          id="loadBarTrack"
        >
          <div
            className="load-bar-fill"
            id="loadBarFill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button className="toggle-btn" id="viewToggle" onClick={onToggleLayout}>
        {viewMode === 'stream' ? 'Switch to Grid' : 'Switch to Column'}
      </button>
    </div>
  )
}
