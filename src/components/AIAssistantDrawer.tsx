import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles } from 'lucide-react'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export default function AIAssistantDrawer() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hi! I'm DocPulse AI. I can help you understand your documentation drift, analyze commit impacts, and suggest improvements. What would you like to know?",
            timestamp: new Date(),
        },
    ])
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = () => {
        if (!input.trim()) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        // Simulate AI response
        setTimeout(() => {
            const responses: Record<string, string> = {
                drift: "Based on the latest analysis, your documentation drift score is **42/100**. The main areas of concern are:\n\n• **Auth module** - 89% drift (critical)\n• **Schema definitions** - 72% drift (high)\n• **Route handlers** - 55% drift (medium)\n\nWould you like me to generate a remediation plan?",
                risk: "The latest commit (abc123f) has a **risk score of 65**. It modifies 3 API endpoints and introduces 1 potential breaking change in the `/users` route. The confidence level is 87%.",
                coverage: "Your current documentation coverage is **93.2%** across 64 endpoints. 3 endpoints are not yet documented:\n\n1. `POST /api/webhooks/github`\n2. `DELETE /api/sessions/:id`\n3. `PATCH /api/users/:id/preferences`",
                default: "I can help you with drift analysis, risk assessment, documentation coverage, and commit intelligence. Try asking about:\n\n• Current drift scores\n• Risk assessment for the latest commit\n• Documentation coverage gaps\n• Breaking change history",
            }

            const lowerInput = userMsg.content.toLowerCase()
            let responseContent = responses.default
            if (lowerInput.includes('drift')) responseContent = responses.drift
            else if (lowerInput.includes('risk')) responseContent = responses.risk
            else if (lowerInput.includes('coverage') || lowerInput.includes('documented')) responseContent = responses.coverage

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseContent,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, assistantMsg])
            setIsTyping(false)
        }, 1200)
    }

    return (
        <>
            {/* FAB Button */}
            <motion.button
                className="ai-fab"
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: isOpen ? 0 : 1 }}
                title="Open AI Assistant"
            >
                <Bot size={22} />
                <span className="ai-fab-pulse" />
            </motion.button>

            {/* Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="ai-drawer-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            className="ai-drawer"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        >
                            {/* Header */}
                            <div className="ai-drawer-header">
                                <div className="ai-drawer-title">
                                    <Sparkles size={18} className="ai-drawer-sparkle" />
                                    <span>DocPulse AI</span>
                                    <span className="ai-drawer-status">Online</span>
                                </div>
                                <button className="ai-drawer-close" onClick={() => setIsOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="ai-drawer-messages">
                                {messages.map(msg => (
                                    <motion.div
                                        key={msg.id}
                                        className={`ai-message ai-message--${msg.role}`}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="ai-message-avatar">
                                                <Bot size={14} />
                                            </div>
                                        )}
                                        <div className="ai-message-content">
                                            <p>{msg.content}</p>
                                            <span className="ai-message-time">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <div className="ai-message ai-message--assistant">
                                        <div className="ai-message-avatar">
                                            <Bot size={14} />
                                        </div>
                                        <div className="ai-typing">
                                            <span /><span /><span />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="ai-drawer-input">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about drift, risk, coverage..."
                                />
                                <button className="ai-send-btn" onClick={handleSend} disabled={!input.trim()}>
                                    <Send size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
