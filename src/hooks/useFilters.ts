import { useCallback, useMemo, useState } from 'react'
import {
  CATEGORY_ORDER,
  categoryOf,
  type FilterCategory,
} from '../config/filterDictionary'
import type { TumblrPost } from '../types'

export const ALL_FILTER = 'all'

export interface FilterGroup {
  category: FilterCategory
  locations: string[]
}

export interface FiltersState {
  currentFilter: string
  groups: FilterGroup[]
  visiblePosts: TumblrPost[]
  setFilter: (location: string) => void
}

/** Rebuilds what `buildCaptionFilters()` used to assemble by hand, from post data. */
export function useFilters(posts: TumblrPost[]): FiltersState {
  const [currentFilter, setCurrentFilter] = useState<string>(ALL_FILTER)

  const groups = useMemo<FilterGroup[]>(() => {
    const locations = new Set<string>()
    for (const post of posts) {
      if (post.location) locations.add(post.location)
    }

    const sorted = Array.from(locations).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    )

    const byCategory = new Map<FilterCategory, string[]>(
      CATEGORY_ORDER.map((category) => [category, []]),
    )
    for (const location of sorted) {
      byCategory.get(categoryOf(location))?.push(location)
    }

    return CATEGORY_ORDER.map((category) => ({
      category,
      locations: byCategory.get(category) ?? [],
    })).filter((group) => group.locations.length > 0)
  }, [posts])

  const visiblePosts = useMemo(() => {
    if (currentFilter === ALL_FILTER) return posts
    const wanted = currentFilter.toLowerCase()
    return posts.filter((post) => post.location?.toLowerCase() === wanted)
  }, [posts, currentFilter])

  const setFilter = useCallback((location: string) => {
    setCurrentFilter((current) => (current === location ? current : location))
  }, [])

  return { currentFilter, groups, visiblePosts, setFilter }
}
