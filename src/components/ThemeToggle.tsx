import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ size = 'default' }: { size?: 'sm' | 'default' }) {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'
    const dim = size === 'sm' ? 32 : 38

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            style={{ width: dim, height: dim }}
        >
            <motion.div
                initial={false}
                animate={{ rotate: isDark ? 0 : 180, scale: [1, 0.85, 1] }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="theme-toggle-icon"
            >
                {isDark ? <Moon size={size === 'sm' ? 14 : 16} /> : <Sun size={size === 'sm' ? 14 : 16} />}
            </motion.div>
        </button>
    )
}
