import type { MusicState } from '../hooks/useYouTubePlayer'

export function MusicControl({
  isPlaying,
  trackTitle,
  volume,
  toggle,
  setVolume,
  containerId,
}: MusicState) {
  return (
    <>
      <div className="music-control-wrapper">
        <button
          className="toggle-btn"
          id="musicToggleBtn"
          onClick={toggle}
          aria-label="Toggle Music"
        >
          {isPlaying ? '♪' : <s>♪</s>}
        </button>
        <div
          id="nowPlayingTrack"
          className={trackTitle ? 'has-track' : undefined}
        >
          <span id="nowPlayingText">{trackTitle}</span>
          <input
            type="range"
            id="volumeSlider"
            min="0"
            max="100"
            value={volume}
            onInput={(e) => setVolume(Number(e.currentTarget.value))}
            aria-label="Volume Control"
          />
        </div>
      </div>

      {/* The IFrame API replaces this node with the (hidden) player iframe. */}
      <div id={containerId} />
    </>
  )
}
