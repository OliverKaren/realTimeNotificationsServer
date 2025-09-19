import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server as SocketIOServer } from 'socket.io'
import Redis from 'ioredis'

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const io = new SocketIOServer(server, {
    cors: { origin: 'http://localhost:5173' }
})

const redisSub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
const redisPub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

const BACKLOG_LIMIT = 20
let backlog = []

function addToBacklog(evt) {
    backlog.push(evt)
    if (backlog.length > BACKLOG_LIMIT) backlog.shift()
}

const CHANNEL = 'notifications'
await redisSub.subscribe(CHANNEL)
redisSub.on('message', (channel, message) => {
    try {
        const evt = JSON.parse(message)
        addToBacklog(evt)
        io.emit('notification', evt)
    } catch (e) {
        console.error('Bad message', e)
    }
})

io.on('connection', (socket) => {
    console.log('client connected', socket.id)
    socket.emit('backlog', backlog)
    socket.on('disconnect', () => console.log('client disconnected', socket.id))
})

app.get('/health', (req, res) => res.json({ ok: true }))

app.post('/notify', async (req, res) => {
    const { type, message } = req.body || {}
    if (!type || !message) return res.status(400).json({ error: 'type and message required' })

    const evt = {
        id: Date.now().toString(),
        type,
        message,
        timestamp: new Date().toISOString()
    }

    try {
        await redisPub.publish(CHANNEL, JSON.stringify(evt))
        res.status(202).json({ accepted: true })
    } catch (err) {
        console.error('publish failed', err)
        res.status(500).json({ error: 'publish failed' })
    }
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => console.log('Server running on Port', PORT))
