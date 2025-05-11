import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App'


const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
console.log('System theme preference:', prefersDark ? 'dark' : 'light')

// Listen for theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    console.log('System theme changed to:', e.matches ? 'dark' : 'light')
})

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)