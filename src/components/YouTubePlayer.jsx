import React, { useState, useRef, useEffect } from 'react'

export default function YouTubePlayer({ onBack }) {
  const [videoUrl, setVideoUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [loopCount, setLoopCount] = useState(1)
  const [loopsCompleted, setLoopsCompleted] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDraggingStart, setIsDraggingStart] = useState(false)
  const [isDraggingEnd, setIsDraggingEnd] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const playerRef = useRef(null)
  const progressBarRef = useRef(null)

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  useEffect(() => {
    if (window.YT) return
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    if (!videoId) return
    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        if (playerRef.current) {
          try { playerRef.current.destroy() }
          catch (e) { console.log('Destroyed previous player') }
        }
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '400',
          width: '100%',
          videoId: videoId,
          playerVars: { autoplay: 0, controls: 1, modestbranding: 1 },
          events: { onReady, onStateChange, onError }
        })
      } else {
        setTimeout(initPlayer, 100)
      }
    }
    initPlayer()
  }, [videoId])

  const onReady = () => {
    try {
      const duration = playerRef.current.getDuration()
      setVideoDuration(duration)
      setEndTime(duration)
      setStartTime(0)
      setCurrentTime(0)
      playerRef.current.setPlaybackRate(playbackSpeed)
      setIsLoaded(true)
    } catch (error) {
      console.error('Player ready error:', error)
    }
  }

  const onStateChange = (event) => {
    const YT = window.YT
    if (event.data === YT.PlayerState.PLAYING) {
      setIsPlaying(true)
    } else if (event.data === YT.PlayerState.PAUSED) {
      setIsPlaying(false)
    } else if (event.data === YT.PlayerState.ENDED) {
      if (loopsCompleted < loopCount - 1) {
        setLoopsCompleted(loopsCompleted + 1)
        playerRef.current?.seekTo(startTime, true)
        playerRef.current?.playVideo()
      } else {
        setIsPlaying(false)
        setLoopsCompleted(0)
      }
    }
  }

  const onError = (event) => {
    console.error('YouTube Error:', event.data)
  }

  // apply speed change whenever playbackSpeed changes
  useEffect(() => {
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(playbackSpeed)
    }
  }, [playbackSpeed])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      try {
        const current = playerRef.current.getCurrentTime()
        setCurrentTime(current)
        if (current >= endTime) {
          if (loopsCompleted < loopCount - 1) {
            setLoopsCompleted(loopsCompleted + 1)
            playerRef.current?.seekTo(startTime, true)
          } else {
            playerRef.current?.pauseVideo()
            setLoopsCompleted(0)
          }
        }
      } catch (e) {
        console.log('Tracking error')
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying, endTime, startTime, loopsCompleted, loopCount])

  const handleLoadVideo = () => {
    if (!videoUrl.trim()) {
      alert('Please enter a YouTube URL')
      return
    }
    const id = extractVideoId(videoUrl)
    if (id) {
      setVideoId(id)
    } else {
      alert('Invalid YouTube URL')
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // resume playback when returning to the app / screen wakes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isPlaying && playerRef.current) {
        try { playerRef.current.playVideo() } catch { /* ignore */ }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isPlaying])

  useEffect(() => {
    const getEventPos = (e) => e.touches ? e.touches[0].clientX : e.clientX

    const handleMove = (e) => {
      if (!progressBarRef.current || (!isDraggingStart && !isDraggingEnd)) return
      e.preventDefault()
      const rect = progressBarRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (getEventPos(e) - rect.left) / rect.width))
      const newTime = percent * videoDuration
      if (isDraggingStart) setStartTime(Math.min(newTime, endTime))
      else if (isDraggingEnd) setEndTime(Math.max(newTime, startTime))
    }
    const handleUp = () => { setIsDraggingStart(false); setIsDraggingEnd(false) }

    if (isDraggingStart || isDraggingEnd) {
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
      window.addEventListener('touchmove', handleMove, { passive: false })
      window.addEventListener('touchend', handleUp)
      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
        window.removeEventListener('touchmove', handleMove)
        window.removeEventListener('touchend', handleUp)
      }
    }
  }, [isDraggingStart, isDraggingEnd, videoDuration, startTime, endTime])

  const startPercent = videoDuration ? (startTime / videoDuration) * 100 : 0
  const endPercent = videoDuration ? (endTime / videoDuration) * 100 : 0
  const currentPercent = videoDuration ? (currentTime / videoDuration) * 100 : 0

  return (
    <div className="youtube-player">
      <button className="back" onClick={onBack}>← Back</button>
      <h2>YouTube Video Player</h2>
      <p>Load a YouTube video and set custom start/end times with looping.</p>

      <div className="control-group">
        <label>YouTube URL:</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" placeholder="Paste YouTube URL here..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLoadVideo()} />
          <button onClick={handleLoadVideo}>Load Video</button>
        </div>
      </div>

      {/* always in DOM so YT.Player can attach on load */}
      <div id="youtube-player" style={{ marginTop: 16, borderRadius: 8, overflow: 'hidden' }}></div>

      {isLoaded && (
        <>

          <div className="progress-section">
            <div ref={progressBarRef} className="progress-bar-container" onClick={(e) => {
              if (!progressBarRef.current) return
              const rect = progressBarRef.current.getBoundingClientRect()
              const percent = (e.clientX - rect.left) / rect.width
              playerRef.current?.seekTo(percent * videoDuration, true)
            }}>
              <div className="progress-bar-background">
                <div className="progress-selection" style={{ left: `${startPercent}%`, right: `${100 - endPercent}%` }} />
                <div className="progress-current" style={{ left: `${currentPercent}%` }} />
                <div className="progress-handle start-handle" style={{ left: `${startPercent}%` }}
                  onMouseDown={() => setIsDraggingStart(true)}
                  onTouchStart={(e) => { e.preventDefault(); setIsDraggingStart(true) }} />
                <div className="progress-handle end-handle" style={{ left: `${endPercent}%` }}
                  onMouseDown={() => setIsDraggingEnd(true)}
                  onTouchStart={(e) => { e.preventDefault(); setIsDraggingEnd(true) }} />
              </div>
            </div>
            <div className="time-display">
              <span>{formatTime(startTime)}</span>
              <span>{formatTime(currentTime)} / {formatTime(videoDuration)}</span>
              <span>{formatTime(endTime)}</span>
            </div>
          </div>

          <div className="time-inputs">
            <div className="control-group">
              <label>Start Time: {formatTime(startTime)}</label>
              <input type="range" min="0" max={videoDuration} step="1" value={startTime}
                onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime))}
                style={{ width: '100%' }} />
            </div>
            <div className="control-group">
              <label>End Time: {formatTime(endTime)}</label>
              <input type="range" min="0" max={videoDuration} step="1" value={endTime}
                onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime))}
                style={{ width: '100%' }} />
            </div>
            <div className="control-group">
              <label>Loop Count:</label>
              <input type="number" min="1" value={loopCount} onChange={(e) => setLoopCount(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>
            <div className="control-group">
              <label>Playback Speed:</label>
              <select value={playbackSpeed} onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}>
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(s => (
                  <option key={s} value={s}>{s}x</option>
                ))}
              </select>
            </div>
          </div>

          <div className="playback-controls">
            <button onClick={() => playerRef.current?.seekTo(Math.max(0, currentTime - 5), true)}>⏮ -5s</button>
            <button onClick={() => { playerRef.current?.seekTo(startTime, true); playerRef.current?.playVideo() }}>▶ Play</button>
            <button onClick={() => playerRef.current?.pauseVideo()}>⏸ Pause</button>
            <button onClick={() => { playerRef.current?.stopVideo(); setCurrentTime(0); setLoopsCompleted(0) }}>⏹ Stop</button>
            <button onClick={() => playerRef.current?.seekTo(Math.min(videoDuration, currentTime + 5), true)}>⏭ +5s</button>
          </div>

          <div className="loop-status">
            <p>Loop Progress: <strong>{loopsCompleted + 1} / {loopCount}</strong></p>
          </div>
        </>
      )}
    </div>
  )
}