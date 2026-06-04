import { useState, useEffect, useRef } from 'react'
import { Delete } from 'lucide-react'

const STORAGE_KEY = 'app_pin'

const KEYS = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['','0','⌫'],
]

export default function PinLock({ onUnlock }) {
  const savedPin = localStorage.getItem(STORAGE_KEY)
  const isSetup = !savedPin

  const [mode, setMode] = useState(isSetup ? 'setup' : 'lock') // setup | confirm | lock
  const [pin, setPin] = useState('')
  const [setupPin, setSetupPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const shakeTimer = useRef(null)

  const triggerShake = (msg) => {
    setError(msg)
    setShake(true)
    clearTimeout(shakeTimer.current)
    shakeTimer.current = setTimeout(() => {
      setShake(false)
      setPin('')
    }, 500)
  }

  const handleKey = (key) => {
    if (key === '⌫') {
      setPin(p => p.slice(0, -1))
      return
    }
    if (key === '') return
    const next = pin + key
    if (next.length > 4) return
    setPin(next)

    if (next.length === 4) {
      setTimeout(() => processPin(next), 100)
    }
  }

  const processPin = (value) => {
    if (mode === 'setup') {
      setSetupPin(value)
      setPin('')
      setMode('confirm')
      setError('')
    } else if (mode === 'confirm') {
      if (value === setupPin) {
        localStorage.setItem(STORAGE_KEY, value)
        onUnlock()
      } else {
        triggerShake("PINs don't match. Try again.")
        setMode('setup')
        setSetupPin('')
      }
    } else if (mode === 'lock') {
      if (value === savedPin) {
        onUnlock()
      } else {
        triggerShake('Wrong PIN. Try again.')
      }
    }
  }

  const title = mode === 'setup'
    ? 'Create PIN'
    : mode === 'confirm'
    ? 'Confirm PIN'
    : 'Enter PIN'

  const subtitle = mode === 'setup'
    ? 'Set a 4-digit PIN to protect your data'
    : mode === 'confirm'
    ? 'Enter PIN again to confirm'
    : 'Enter your PIN to continue'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: 'linear-gradient(160deg, #E8EEF5 0%, #EDF3F0 100%)' }}>

      {/* Title */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <span className="text-3xl">💰</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>

      {/* PIN dots */}
      <div className={`flex gap-5 mb-2 ${shake ? 'animate-shake' : ''}`}>
        {[0,1,2,3].map(i => (
          <div key={i}
            className={`w-4 h-4 rounded-full transition-all duration-150 ${
              i < pin.length
                ? 'bg-gray-900 scale-110'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Error */}
      <div className="h-6 mb-6 flex items-center">
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      </div>

      {/* Keypad */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {KEYS.map((row, ri) => (
          <div key={ri} className="flex gap-3">
            {row.map((key, ki) => (
              <button
                key={ki}
                onClick={() => handleKey(key)}
                disabled={key === ''}
                className={`flex-1 h-16 rounded-2xl text-xl font-semibold transition-all select-none
                  ${key === '' ? 'invisible' : ''}
                  ${key === '⌫'
                    ? 'bg-transparent text-gray-400 hover:text-gray-600 active:scale-95'
                    : 'bg-white text-gray-900 shadow-sm hover:bg-gray-50 active:scale-95 active:bg-gray-100'
                  }`}
                style={key !== '⌫' && key !== '' ? { boxShadow: '0 2px 8px rgba(100,120,140,0.1)' } : {}}
              >
                {key === '⌫' ? <Delete size={20} className="mx-auto" /> : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
