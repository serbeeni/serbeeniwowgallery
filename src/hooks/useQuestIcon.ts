import { useCallback, useState } from 'react'
import { QUEST_STORAGE_KEY } from '../config/assets'

function alreadyCompleted(): boolean {
  try {
    return localStorage.getItem(QUEST_STORAGE_KEY) === 'true'
  } catch {
    // Private mode / blocked storage — behave as if the quest is still open.
    return false
  }
}

export interface QuestState {
  /** The bouncing marker above the Menu button — hidden as soon as the menu is opened. */
  showFloatingIcon: boolean
  /** The inline marker next to the Guide link — stays until the Guide link is clicked. */
  showInlineIcon: boolean
  onMenuOpened: () => void
  onGuideClicked: () => void
}

/** Port of the standalone quest-icon IIFE, including the localStorage key it wrote. */
export function useQuestIcon(): QuestState {
  const [completed, setCompleted] = useState(alreadyCompleted)
  const [menuOpened, setMenuOpened] = useState(false)

  const onMenuOpened = useCallback(() => setMenuOpened(true), [])

  const onGuideClicked = useCallback(() => {
    try {
      localStorage.setItem(QUEST_STORAGE_KEY, 'true')
    } catch {
      // Not being able to persist should not keep the icons on screen.
    }
    setCompleted(true)
  }, [])

  return {
    showFloatingIcon: !completed && !menuOpened,
    showInlineIcon: !completed,
    onMenuOpened,
    onGuideClicked,
  }
}
