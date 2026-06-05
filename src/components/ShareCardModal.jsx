import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { X, Download, Image } from 'lucide-react'
import dayjs from 'dayjs'
import mascot from '../assets/mascot.png'
import qr from '../assets/qr.png'

const GRAD = 'linear-gradient(135deg, #c8dff5 0%, #d8eaf0 40%, #f5dfc8 100%)'
const DARK2 = 'transparent'

// shared styles
const SEC = { padding: '0 24px', borderBottom: '1px solid rgba(30,40,60,0.08)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }
const SEC_LAST = { padding: '0 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }
const LABEL = { fontSize: 9, color: 'rgba(30,40,60,0.45)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }
const BIG = { fontSize: 28, fontWeight: 800, color: '#1a1f2e', letterSpacing: -0.5 }
const BIG_RED = { fontSize: 28, fontWeight: 800, color: '#d95c5c', letterSpacing: -0.5 }
const AVATAR = { width: 28, height: 28, borderRadius: 8, background: 'rgba(106,155,170,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#6A9BAA' }
const DATE_SUB = { fontSize: 12, color: 'rgba(30,40,60,0.4)', marginTop: 6, fontWeight: 500 }

function Header({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={mascot} alt="" style={{ width: 56, height: 56, objectFit: 'contain' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(30,40,60,0.35)', letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(30,40,60,0.4)' }}>{dayjs().format('D MMM YYYY')}</div>
    </div>
  )
}

// ─── Monthly Card ───────────────────────────────────────────────────────────
function MonthlyCardContent({ monthLabel, summary, members, selectedMember, selectedItem }) {
  const memberLabel = selectedMember || members.map(m => m.name).join(', ') || 'All Members'
  const itemLabel = selectedItem || 'All Items'

  return (
    <div style={{
      width: 400, aspectRatio: '4/5',
      background: GRAD,
      borderRadius: 32, padding: 28,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans Lao', system-ui, -apple-system, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      <Header label="Monthly" />

      <div style={{ background: DARK2, borderRadius: 24, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* S1: Member + month as sub text */}
        <div style={SEC}>
          <div style={LABEL}>Member</div>
          <div style={BIG}>{memberLabel}</div>
          <div style={DATE_SUB}>{monthLabel}</div>
        </div>

        {/* S2: Item */}
        <div style={SEC}>
          <div style={LABEL}>Item</div>
          <div style={BIG}>{itemLabel}</div>
        </div>

        {/* S3: Total */}
        {(() => {
          const entries = Object.entries(summary)
          return (
            <div style={SEC_LAST}>
              <div style={LABEL}>Total</div>
              {entries.map(([cur, s]) => (
                <div key={cur} style={BIG_RED}>{cur}{s.total.toLocaleString()}</div>
              ))}
              <img src={qr} alt="QR" style={{ position: 'absolute', bottom: 16, right: 20, width: 72, height: 72, borderRadius: 8, opacity: 0.92 }} />
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// ─── Entry Card ──────────────────────────────────────────────────────────────
function EntryCardContent({ entry }) {
  return (
    <div style={{
      width: 400, aspectRatio: '4/5',
      background: GRAD,
      borderRadius: 32, padding: 28,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans Lao', system-ui, -apple-system, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      <Header label="Daily" />

      <div style={{ background: DARK2, borderRadius: 24, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* S1: Member + entry date */}
        <div style={SEC}>
          <div style={LABEL}>Member</div>
          <div style={BIG}>{entry.name}</div>
          <div style={DATE_SUB}>{dayjs(entry.date).format('ddd, D MMM YYYY')}</div>
        </div>

        {/* S2: Item */}
        <div style={SEC}>
          <div style={LABEL}>Item</div>
          <div style={BIG}>{entry.menu || '—'}</div>
          {entry.description && <div style={{ fontSize: 12, color: 'rgba(30,40,60,0.4)', marginTop: 4 }}>{entry.description}</div>}
        </div>

        {/* S3: Amount */}
        <div style={SEC_LAST}>
          <div style={LABEL}>Amount</div>
          <div style={BIG_RED}>{entry.currency || '฿'}{entry.price.toLocaleString()}</div>
          <img src={qr} alt="QR" style={{ position: 'absolute', bottom: 16, right: 20, width: 72, height: 72, borderRadius: 8, opacity: 0.92 }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Modal ──────────────────────────────────────────────────────────────
export default function ShareCardModal({ type, data, onClose }) {
  const cardRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 4, useCORS: true, backgroundColor: null,
      })
      const filename = type === 'monthly'
        ? `payment-${data.monthLabel.replace(' ', '-')}.jpg`
        : `payment-${data.entry.name}-${data.entry.date}.jpg`

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95))
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
      const file = new File([blob], filename, { type: 'image/jpeg' })
      if (isIOS && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        // iOS: Share sheet → Add to Photos
        await navigator.share({ files: [file] })
      } else {
        // Mac / Android / desktop: download ตรงๆ
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
            ? <MonthlyCardContent {...data} />
            : <EntryCardContent {...data} />
          }
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
