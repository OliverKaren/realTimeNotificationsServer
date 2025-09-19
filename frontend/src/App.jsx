import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import './index.css'

export default function App() {
    const [events, setEvents] = useState([])
    const [status, setStatus] = useState('disconnected')
    const socketRef = useRef(null)
    const seenIds = useRef(new Set())

    useEffect(() => {
        const s = io('http://localhost:3001', { autoConnect: true, reconnection: true })
        socketRef.current = s

        s.on('connect', () => setStatus('connected'))
        s.on('disconnect', () => setStatus('disconnected'))

        s.on('backlog', (items) => {
            const newEvents = [...events]
            for (const it of items) {
                if (!seenIds.current.has(it.id)) {
                    newEvents.push(it)
                    seenIds.current.add(it.id)
                }
            }
            newEvents.sort((a, b) => Number(a.id) - Number(b.id))
            setEvents(newEvents.slice(-50))
        })

        s.on('notification', (evt) => {
            if (seenIds.current.has(evt.id)) return
            seenIds.current.add(evt.id)
            setEvents((prev) => [...prev.slice(-49), evt])
        })

        return () => s.close()
    }, [])

    return (
        <div className="app-container">
            <h1>Live Notifications</h1>
            <div className="status">
                Status: <span className={status}>{status}</span>
            </div>

            {events.length === 0 && <div className="empty">No notifications yet. Send one via POST /notify</div>}

            <ul className="event-list">
                {events.map((e) => (
                    <li key={e.id} className={`event-card ${e.type}`}>
                        <div className="event-type">{e.type}</div>
                        <div className="event-message">{e.message}</div>
                        <div className="event-time">{new Date(e.timestamp).toLocaleTimeString()}</div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
