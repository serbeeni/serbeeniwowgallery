import { useCallback, useMemo, useState } from 'react'
import { BackToTop } from './components/BackToTop'
import { BlogHeader } from './components/BlogHeader'
import { ControlsBar } from './components/ControlsBar'
import { Lightbox } from './components/Lightbox'
import { MusicControl } from './components/MusicControl'
import { PostList } from './components/PostList'
import { VersionTag } from './components/VersionTag'
import { SCROLL_TO_POST_DELAY } from './config/site'
import { useBackToTop } from './hooks/useBackToTop'
import { useFilters } from './hooks/useFilters'
import { useInfiniteScroll } from './hooks/useInfiniteScroll'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useLightbox } from './hooks/useLightbox'
import { useMenus } from './hooks/useMenus'
import { tumblrConfig, usePosts } from './hooks/usePosts'
import { useQuestIcon } from './hooks/useQuestIcon'
import { useYouTubePlayer } from './hooks/useYouTubePlayer'
import type { ViewMode } from './types'

export default function App() {
  const {
    posts,
    hasMore,
    allLoaded,
    isBatchLoading,
    isFetching,
    progress,
    progressActive,
    loadNextPage,
    loadAll,
  } = usePosts()

  const [viewMode, setViewMode] = useState<ViewMode>('stream')
  const [sortOldestFirst, setSortOldestFirst] = useState(false)

  const menus = useMenus()
  const quest = useQuestIcon()
  const lightbox = useLightbox()
  const music = useYouTubePlayer()
  const showBackToTop = useBackToTop()
  const { groups, visiblePosts, setFilter } = useFilters(posts)

  // Detect if we are currently viewing a Tumblr Custom Page
  const customPageEl = typeof document !== 'undefined' ? document.getElementById('custom-page-data') : null
  const customPageHtml = customPageEl?.innerHTML
  const customPageTitle = customPageEl?.getAttribute('data-title')

  const displayedPosts = useMemo(
    () => (sortOldestFirst ? visiblePosts.slice().reverse() : visiblePosts),
    [visiblePosts, sortOldestFirst],
  )

  useInfiniteScroll(hasMore && !isBatchLoading, loadNextPage)

  const toggleLayout = useCallback(
    () => setViewMode((mode) => (mode === 'stream' ? 'grid' : 'stream')),
    [],
  )

  /** Clicking a grid tile drops back into the stream and scrolls to that post. */
  const selectPost = useCallback((domId: string) => {
    setViewMode('stream')
    setTimeout(() => {
      document
        .getElementById(domId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, SCROLL_TO_POST_DELAY)
  }, [])

  const toggleSort = useCallback(() => {
    if (!allLoaded) return
    setSortOldestFirst((value) => !value)
  }, [allLoaded])

  useKeyboardShortcuts({
    onToggleMenu: () => {
      menus.toggle('main')
      quest.onMenuOpened()
    },
    onToggleFilter: () => menus.toggle('filter'),
    onLoadAll: loadAll,
    onToggleLayout: toggleLayout,
    onToggleSort: toggleSort,
    onToggleMusic: music.toggle,
  })

  return (
    <>
      <BlogHeader
        title={tumblrConfig.title}
        descriptionHtml={tumblrConfig.descriptionHtml}
      />

      {/* IF CUSTOM PAGE: Render the custom page body */}
      {customPageHtml ? (
        <main className="custom-page-wrapper">
          {customPageTitle && <h2 className="custom-page-title">{customPageTitle}</h2>}
          <div 
            className="post-body-render custom-page-content"
            dangerouslySetInnerHTML={{ __html: customPageHtml }} 
          />
        </main>
      ) : (
        /* OTHERWISE: Render standard blog feed and controls */
        <>
          <ControlsBar
            pages={tumblrConfig.pages}
            openMenu={menus.openMenu}
            onToggleMenu={menus.toggle}
            onCloseMenus={menus.closeAll}
            quest={quest}
            filterGroups={groups}
            filtersReady={allLoaded || !hasMore}
            onSelectFilter={setFilter}
            isBatchLoading={isBatchLoading}
            allLoaded={allLoaded}
            progress={progress}
            progressActive={progressActive}
            onLoadAll={loadAll}
            sortOldestFirst={sortOldestFirst}
            onToggleSort={toggleSort}
            viewMode={viewMode}
            onToggleLayout={toggleLayout}
          />

          <PostList
            posts={displayedPosts}
            viewMode={viewMode}
            onSelect={selectPost}
            onImageClick={lightbox.open}
          />

          {isFetching && (
            <div className="infinite-scroll-status" id="scrollStatus">
              Loading...
            </div>
          )}
        </>
      )}

      <BackToTop visible={showBackToTop} />

      <VersionTag />

      <MusicControl {...music} />

      {lightbox.src && (
        <Lightbox
          src={lightbox.src}
          onClose={lightbox.close}
          onMounted={lightbox.enterFullscreen}
        />
      )}
    </>
  )
}
