import React, { useEffect, useState } from 'react'

export default function FindIP({ onBack }) {
  const [ip, setIp] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchIp = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setIp(data.ip)
    } catch (e) {
      setError('Failed to fetch IP. Please try again.')
      setIp(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchIp() }, [])

  const copy = async () => {
    if (!ip) return
    try {
      await navigator.clipboard.writeText(ip)
      // small visual feedback could be added here
    } catch {
      alert('Copy failed — please select the IP and copy manually.')
    }
  }

  return (
    <div className="find-words">
      <button className="back" onClick={onBack}>← Back</button>
      <h2>What is my IP?</h2>
      <p>This tool shows your public IP address as seen by external services.</p>

      <div className="controls">
        <button onClick={fetchIp} disabled={loading}>{loading ? 'Checking...' : 'Check IP'}</button>
        <button onClick={copy} disabled={!ip}>Copy</button>
      </div>

      <div className="results" style={{marginTop:16}}>
        {error && <p className="message">{error}</p>}
        {!error && ip && <p><strong>Your IP:</strong> {ip}</p>}
        {!error && !ip && !loading && <p>No IP detected yet.</p>}
      </div>

      <p style={{marginTop:12, fontSize:'90%', color:'#555'}}>
        Note: this returns the public IP seen by websites. If you use a VPN or proxy, it may show the VPN/proxy IP.
      </p>
    </div>
  )
}
