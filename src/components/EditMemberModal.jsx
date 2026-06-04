import { useState } from 'react'
import { X } from 'lucide-react'
import { AVATARS, PixelAvatarIcon } from './PixelAvatar'

export default function EditMemberModal({ person, onClose, onUpdate }) {
  const [name, setName] = useState(person.name)
  const [avatarId, setAvatarId] = useState(person.icon || 'ghost')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onUpdate(person.id, name, avatarId)
    setSaving(false)
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-3xl p-6"
        style={{
          background: 'rgba(255,255,255,0.97)',
          boxShadow: '0 20px 60px rgba(100,120,140,0.25)',
          border: '1px solid rgba(255,255,255,0.9)'
        }}>

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg" style={{ color: '#2D3A48' }}>Edit Member</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#EEF0F5', color: '#8A9BAA' }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Preview */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center overflow-hidden"
              style={{
                background: '#EEF0F5',
                boxShadow: '6px 6px 16px rgba(100,120,140,0.2), -3px -3px 8px rgba(255,255,255,0.9)'
              }}>
              <PixelAvatarIcon avatarId={avatarId} size={56} />
            </div>
          </div>

          {/* Avatar picker */}
          <div className="rounded-2xl p-3" style={{ background: '#EEF0F5' }}>
            <p className="text-xs font-semibold mb-2 px-1" style={{ color: '#8A9BAA' }}>Choose avatar</p>
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map(av => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatarId(av.id)}
                  className="w-full aspect-square rounded-2xl flex items-center justify-center overflow-hidden transition-all active:scale-90"
                  style={{
                    background: avatarId === av.id ? '#DDEEF8' : 'rgba(255,255,255,0.8)',
                    boxShadow: avatarId === av.id
                      ? '0 0 0 2px #88BBDD, 2px 2px 8px rgba(100,150,200,0.3)'
                      : '2px 2px 4px rgba(100,120,140,0.12)',
                    transform: avatarId === av.id ? 'scale(1.08)' : 'scale(1)'
                  }}
                >
                  <PixelAvatarIcon avatarId={av.id} size={36} />
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <input
            autoFocus
            type="text"
            placeholder="Member name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="rounded-2xl px-4 py-3 text-sm focus:outline-none"
            style={{
              background: '#EEF0F5',
              boxShadow: 'inset 2px 2px 6px rgba(100,120,140,0.15), inset -1px -1px 4px rgba(255,255,255,0.8)',
              border: 'none',
              color: '#2D3A48'
            }}
          />

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded-2xl py-3 font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #8ABCD0, #7AAAC0)' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
