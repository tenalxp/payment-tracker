import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { X, Download, Image, ImagePlus } from 'lucide-react'
import dayjs from 'dayjs'
import mascot from '../assets/mascot.png'
import qr from '../assets/qr.png'

const PRESETS = [
  { id: 'default', bg: 'linear-gradient(135deg, #c8dff5 0%, #d8eaf0 40%, #f5dfc8 100%)', thumb: 'linear-gradient(135deg, #c8dff5, #f5dfc8)' },
  { id: 'rose',    bg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 50%, #ffdde1 100%)', thumb: 'linear-gradient(135deg, #fce4ec, #ffdde1)' },
  { id: 'mint',    bg: 'linear-gradient(135deg, #c8f5e0 0%, #b2f0e8 50%, #d4f5d0 100%)', thumb: 'linear-gradient(135deg, #c8f5e0, #d4f5d0)' },
  { id: 'peach',   bg: 'linear-gradient(135deg, #ffe0b2 0%, #ffccbc 50%, #fff3e0 100%)', thumb: 'linear-gradient(135deg, #ffe0b2, #fff3e0)' },
  { id: 'lavender',bg: 'linear-gradient(135deg, #e8d5f5 0%, #d4c5e8 50%, #ede0f8 100%)', thumb: 'linear-gradient(135deg, #e8d5f5, #ede0f8)' },
  { id: 'night',   bg: 'linear-gradient(135deg, #1a2236 0%, #243048 50%, #1e2a40 100%)', thumb: 'linear-gradient(135deg, #1a2236, #1e2a40)', dark: true },
]

// shared styles
const SEC = { padding: '0 24px', borderBottom: '1px solid rgba(30,40,60,0.08)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }
const SEC_LAST = { padding: '0 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }
const LABEL = { fontSize: 9, color: 'rgba(30,40,60,0.45)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }
const DATE_SUB = { fontSize: 12, color: 'rgba(30,40,60,0.4)', marginTop: 6, fontWeight: 500 }

function makeStyles(dark) {
  return {
    LABEL: { ...LABEL, color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(30,40,60,0.45)' },
    DATE_SUB: { ...DATE_SUB, color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(30,40,60,0.4)' },
    BIG: { fontSize: 28, fontWeight: 800, color: dark ? '#fff' : '#1a1f2e', letterSpacing: -0.5 },
    BIG_RED: { fontSize: 28, fontWeight: 800, color: dark ? '#ff8a80' : '#d95c5c', letterSpacing: -0.5 },
    HEADER_DATE: { fontSize: 11, color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(30,40,60,0.4)' },
    HEADER_LABEL: { fontSize: 11, fontWeight: 700, color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(30,40,60,0.35)', letterSpacing: 0.5, textTransform: 'uppercase' },
    SEC: { ...SEC, borderBottom: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(30,40,60,0.08)' },
  }
}

function Header({ label, dark }) {
  const s = makeStyles(dark)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={mascot} alt="" style={{ width: 56, height: 56, objectFit: 'contain' }} />
        <span style={s.HEADER_LABEL}>{label}</span>
      </div>
      <div style={s.HEADER_DATE}>{dayjs().format('D MMM YYYY')}</div>
    </div>
  )
}

// ─── Monthly Card ───────────────────────────────────────────────────────────
function MonthlyCardContent({ monthLabel, summary, members, selectedMember, selectedItem, dateRange, bg, customBg, dark }) {
  const memberLabel = selectedMember || members.map(m => m.name).join(', ') || 'All Members'
  const itemLabel = selectedItem || 'All Items'
  const s = makeStyles(dark)

  const backgroundStyle = customBg
    ? { backgroundImage: `url(${customBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: bg }

  return (
    <div style={{
      width: 400, aspectRatio: '4/5',
      ...backgroundStyle,
      borderRadius: 32, padding: 28,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans Lao', system-ui, -apple-system, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* overlay for custom photo */}
      {customBg && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', borderRadius: 32 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Header label="Monthly" dark={dark || !!customBg} />
        <div style={{ borderRadius: 24, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column',
          background: customBg ? 'rgba(255,255,255,0.12)' : 'transparent',
          backdropFilter: customBg ? 'blur(8px)' : 'none' }}>
          <div style={customBg ? { ...SEC, borderBottom: '1px solid rgba(255,255,255,0.12)' } : s.SEC}>
            <div style={customBg ? { ...LABEL, color: 'rgba(255,255,255,0.5)' } : s.LABEL}>Member</div>
            <div style={customBg ? { fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 } : s.BIG}>{memberLabel}</div>
            <div style={customBg ? { ...DATE_SUB, color: 'rgba(255,255,255,0.5)' } : s.DATE_SUB}>{dateRange || monthLabel}</div>
          </div>
          <div style={customBg ? { ...SEC, borderBottom: '1px solid rgba(255,255,255,0.12)' } : s.SEC}>
            <div style={customBg ? { ...LABEL, color: 'rgba(255,255,255,0.5)' } : s.LABEL}>Item</div>
            <div style={customBg ? { fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 } : s.BIG}>{itemLabel}</div>
          </div>
          {(() => {
            const entries = Object.entries(summary)
            return (
              <div style={SEC_LAST}>
                <div style={customBg ? { ...LABEL, color: 'rgba(255,255,255,0.5)' } : s.LABEL}>Total</div>
                {entries.map(([cur, sv]) => (
                  <div key={cur} style={customBg ? { fontSize: 28, fontWeight: 800, color: '#ff8a80', letterSpacing: -0.5 } : s.BIG_RED}>{cur}{sv.total.toLocaleString()}</div>
                ))}
                <img src={qr} alt="QR" style={{ position: 'absolute', bottom: 16, right: 20, width: 72, height: 72, borderRadius: 8, opacity: 0.92 }} />
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

// ─── Entry Card ──────────────────────────────────────────────────────────────
function EntryCardContent({ entry, bg, customBg, dark }) {
  const s = makeStyles(dark)

  const backgroundStyle = customBg
    ? { backgroundImage: `url(${customBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: bg }

  return (
    <div style={{
      width: 400, aspectRatio: '4/5',
      ...backgroundStyle,
      borderRadius: 32, padding: 28,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans Lao', system-ui, -apple-system, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {customBg && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', borderRadius: 32 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Header label="Daily" dark={dark || !!customBg} />
        <div style={{ borderRadius: 24, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column',
          background: customBg ? 'rgba(255,255,255,0.12)' : 'transparent',
          backdropFilter: customBg ? 'blur(8px)' : 'none' }}>
          <div style={customBg ? { ...SEC, borderBottom: '1px solid rgba(255,255,255,0.12)' } : s.SEC}>
            <div style={customBg ? { ...LABEL, color: 'rgba(255,255,255,0.5)' } : s.LABEL}>Member</div>
            <div style={customBg ? { fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 } : s.BIG}>{entry.name}</div>
            <div style={customBg ? { ...DATE_SUB, color: 'rgba(255,255,255,0.5)' } : s.DATE_SUB}>{dayjs(entry.date).format('ddd, D MMM YYYY')}</div>
          </div>
          <div style={customBg ? { ...SEC, borderBottom: '1px solid rgba(255,255,255,0.12)' } : s.SEC}>
            <div style={customBg ? { ...LABEL, color: 'rgba(255,255,255,0.5)' } : s.LABEL}>Item</div>
            <div style={customBg ? { fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 } : s.BIG}>{entry.menu || '—'}</div>
            {entry.description && <div style={{ fontSize: 12, color: customBg ? 'rgba(255,255,255,0.5)' : 'rgba(30,40,60,0.4)', marginTop: 4 }}>{entry.description}</div>}
          </div>
          <div style={SEC_LAST}>
            <div style={customBg ? { ...LABEL, color: 'rgba(255,255,255,0.5)' } : s.LABEL}>Amount</div>
            <div style={customBg ? { fontSize: 28, fontWeight: 800, color: '#ff8a80', letterSpacing: -0.5 } : s.BIG_RED}>{entry.currency || '฿'}{entry.price.toLocaleString()}</div>
            <img src={qr} alt="QR" style={{ position: 'absolute', bottom: 16, right: 20, width: 72, height: 72, borderRadius: 8, opacity: 0.92 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Modal ──────────────────────────────────────────────────────────────
export default function ShareCardModal({ type, data, onClose }) {
  const cardRef = useRef(null)
  const fileRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [customBg, setCustomBg] = useState(null)

  const preset = PRESETS[selectedPreset]

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCustomBg(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handlePresetSelect = (i) => {
    setSelectedPreset(i)
    setCustomBg(null)
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 4, useCORS: true, backgroundColor: null,
        allowTaint: true,
      })
      const filename = type === 'monthly'
        ? `payment-${data.monthLabel.replace(' ', '-')}.jpg`
        : `payment-${data.entry.name}-${data.entry.date}.jpg`

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95))
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
      const file = new File([blob], filename, { type: 'image/jpeg' })
      if (isIOS && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] })
      } else {
        const link = document.createElement('a')
        link.download = filename
        link.href = URL.createObjectURL(blob)
        link.click()
        URL.revokeObjectURL(link.href)
      }
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: 'blur(12px)' }}>
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">

        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Image size={16} className="text-white/60" />
            <span className="text-white/80 text-sm font-medium">Preview</span>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-white/20">
            <X size={14} />
          </button>
        </div>

        <div ref={cardRef} style={{ borderRadius: 32, overflow: 'hidden', width: '100%' }}>
          {type === 'monthly'
            ? <MonthlyCardContent {...data} bg={preset.bg} customBg={customBg} dark={preset.dark} />
            : <EntryCardContent {...data} bg={preset.bg} customBg={customBg} dark={preset.dark} />
          }
        </div>

        {/* Background picker */}
        <div className="w-full">
          <p className="text-white/50 text-[10px] uppercase tracking-widest mb-2 px-1">Background</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {PRESETS.map((p, i) => (
              <button
                key={p.id}
                onClick={() => handlePresetSelect(i)}
                style={{ background: p.thumb, minWidth: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  border: selectedPreset === i && !customBg ? '2.5px solid #fff' : '2.5px solid transparent',
                  boxShadow: selectedPreset === i && !customBg ? '0 0 0 1px rgba(255,255,255,0.3)' : 'none' }}
              />
            ))}
            {/* Custom photo button */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{ minWidth: 40, height: 40, borderRadius: 12, flexShrink: 0, overflow: 'hidden',
                border: customBg ? '2.5px solid #fff' : '2.5px solid rgba(255,255,255,0.2)',
                boxShadow: customBg ? '0 0 0 1px rgba(255,255,255,0.3)' : 'none',
                background: customBg ? `url(${customBg}) center/cover` : 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}
            >
              {!customBg && <ImagePlus size={16} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>
        </div>

        <button onClick={handleDownload} disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 rounded-2xl py-3.5 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-60">
          <Download size={16} />
          {downloading ? 'Saving...' : 'Save as JPEG'}
        </button>
      </div>
    </div>
  )
}
