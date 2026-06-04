import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { X, Download, Image } from 'lucide-react'
import dayjs from 'dayjs'
import mascot from '../assets/mascot.png'

const GRAD = 'linear-gradient(135deg, #c8dff5 0%, #d8eaf0 40%, #f5dfc8 100%)'
const CARD = 'transparent'
const DARK = 'transparent'
const DARK2 = 'transparent'

// shared styles
const SEC = { padding: '22px 24px', borderBottom: '1px solid rgba(30,40,60,0.08)' }
const SEC_LAST = { padding: '22px 24px' }
const LABEL = { fontSize: 9, color: 'rgba(30,40,60,0.45)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }
const BIG = { fontSize: 36, fontWeight: 800, color: '#1a1f2e', letterSpacing: -1 }
const CHIP_R = { background: '#fff0ee', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#e53935' }
const CHIP_G = { background: '#edfff5', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#2e7d32' }
const AVATAR = { width: 28, height: 28, borderRadius: 8, background: 'rgba(106,155,170,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#6A9BAA' }

// ─── Monthly Card ───────────────────────────────────────────────────────────
function MonthlyCardContent({ monthLabel, summary, members }) {
  return (
    <div style={{
      width: 400, aspectRatio: '4/5',
      background: GRAD,
      borderRadius: 32, padding: 28,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={mascot} alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 10, color: 'rgba(30,40,60,0.5)', letterSpacing: 2, textTransform: 'uppercase' }}>Payment Tracker</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1f2e' }}>{monthLabel}</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(30,40,60,0.4)' }}>{dayjs().format('D MMM YYYY')}</div>
      </div>

      {/* Single unified card */}
      <div style={{ background: DARK2, borderRadius: 24, overflow: 'hidden', flex: 1 }}>

        {/* Total section */}
        {Object.entries(summary).map(([cur, s]) => (
          <div key={cur} style={SEC}>
            <div style={LABEL}>Total</div>
            <div style={BIG}>{cur}{s.total.toLocaleString()}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              {s.pending > 0 && <div style={CHIP_R}>Pending -{cur}{s.pending.toLocaleString()}</div>}
              {s.paid > 0 && <div style={CHIP_G}>Paid {cur}{s.paid.toLocaleString()}</div>}
            </div>
          </div>
        ))}

        {/* Members section */}
        <div style={SEC_LAST}>
          <div style={LABEL}>Members · {members.length} people</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {members.slice(0, 7).map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={AVATAR}>{m.name.slice(0, 2).toUpperCase()}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1f2e' }}>{m.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: m.pending > 0 ? '#e53935' : '#2e7d32' }}>
                  {m.currency}{m.total.toLocaleString()}
                </span>
              </div>
            ))}
            {members.length > 7 && <div style={{ fontSize: 11, color: 'rgba(30,40,60,0.35)', textAlign: 'center' }}>+{members.length - 7} more</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Entry Card ──────────────────────────────────────────────────────────────
function EntryCardContent({ entry }) {
  const isPending = entry.status === 'pending'
  return (
    <div style={{
      width: 400, aspectRatio: '4/5',
      background: GRAD,
      borderRadius: 32, padding: 28,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Header — same as Monthly */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={mascot} alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 10, color: 'rgba(30,40,60,0.5)', letterSpacing: 2, textTransform: 'uppercase' }}>Payment Tracker</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1f2e' }}>{dayjs(entry.date).format('ddd, D MMM YYYY')}</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(30,40,60,0.4)' }}>{dayjs().format('D MMM YYYY')}</div>
      </div>

      {/* Single unified transparent section — same as Monthly */}
      <div style={{ background: DARK2, borderRadius: 24, overflow: 'hidden', flex: 1 }}>

        {/* Member */}
        <div style={SEC}>
          <div style={LABEL}>Member</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={AVATAR}>{entry.name.slice(0, 2).toUpperCase()}</div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#1a1f2e' }}>{entry.name}</span>
          </div>
        </div>

        {/* Item */}
        <div style={SEC}>
          <div style={LABEL}>Item</div>
          <div style={BIG}>{entry.menu || '—'}</div>
          {entry.description && <div style={{ fontSize: 12, color: 'rgba(30,40,60,0.4)', marginTop: 4 }}>{entry.description}</div>}
        </div>

        {/* Amount */}
        <div style={SEC_LAST}>
          <div style={LABEL}>Amount</div>
          <div style={BIG}>{entry.currency || '฿'}{entry.price.toLocaleString()}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <div style={isPending ? CHIP_R : CHIP_G}>
              {isPending ? 'Pending' : entry.status === 'paid_qr' ? 'Paid · QR' : 'Paid · Cash'}
            </div>
          </div>
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
        scale: 2, useCORS: true, backgroundColor: null,
      })
      const link = document.createElement('a')
      link.download = type === 'monthly'
        ? `payment-${data.monthLabel.replace(' ', '-')}.jpg`
        : `payment-${data.entry.name}-${data.entry.date}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
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
