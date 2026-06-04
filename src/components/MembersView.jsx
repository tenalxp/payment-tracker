import { useState } from 'react'
import { Plus, X, Clock } from 'lucide-react'
import { usePeople } from '../hooks/usePeople'
import AddMemberModal from './AddMemberModal'
import EditMemberModal from './EditMemberModal'
import PersonHistoryModal from './PersonHistoryModal'
import { PixelAvatarIcon } from './PixelAvatar'

const COLORS = [
  'bg-slate-500', 'bg-zinc-500', 'bg-stone-500', 'bg-neutral-600',
  'bg-gray-600',  'bg-slate-600', 'bg-zinc-600', 'bg-stone-600',
  'bg-slate-400', 'bg-zinc-400', 'bg-stone-400', 'bg-neutral-500',
  'bg-gray-500',  'bg-slate-700',
]

function getColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function getInitials(name) {
  return name.trim().slice(0, 2).toUpperCase()
}

function Avatar({ name, icon, size = 'lg' }) {
  const color = getColor(name)
  const sizeClass = size === 'lg' ? 'w-16 h-16' : size === 'md' ? 'w-14 h-14' : size === 'sm' ? 'w-10 h-10' : 'w-6 h-6'
  const textSizeClass = size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : size === 'sm' ? 'text-sm' : 'text-[9px]'
  const pixelSize = size === 'lg' ? 52 : size === 'md' ? 44 : size === 'sm' ? 32 : 20

  if (icon) {
    return (
      <div className={`${sizeClass} rounded-2xl flex items-center justify-center select-none overflow-hidden`}
        style={{
          background: 'linear-gradient(135deg, #E8EEF5, #DDE5EE)',
          boxShadow: '4px 4px 10px rgba(100,120,140,0.18), -2px -2px 6px rgba(255,255,255,0.9)'
        }}>
        <PixelAvatarIcon avatarId={icon} size={pixelSize} />
      </div>
    )
  }

  return (
    <div className={`${sizeClass} ${color} rounded-2xl flex items-center justify-center text-white font-bold shadow-md select-none ${textSizeClass}`}>
      {getInitials(name)}
    </div>
  )
}

export { Avatar, getColor, getInitials }

export default function MembersView() {
  const { people, loading, deletePerson, updatePerson } = usePeople()
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [historyPerson, setHistoryPerson] = useState(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Members</h2>
          <p className="text-sm text-gray-400">{people.length} people</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-4 gap-6 sm:grid-cols-5 md:grid-cols-6">

          {/* Add button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors bg-white"
            >
              <Plus size={24} />
            </button>
            <div className="text-center">
              <div className="text-xs font-medium text-gray-600">Add</div>
              <div className="text-xs text-gray-400">Member</div>
            </div>
          </div>

          {/* Member cards */}
          {people.map(person => (
            <div key={person.id} className="flex flex-col items-center gap-2 group relative">
              <div className="relative">
                <button onClick={() => setSelectedPerson(person)} className="focus:outline-none">
                  <Avatar name={person.name} icon={person.icon} />
                </button>
                {/* Delete button */}
                <button
                  onClick={() => setConfirmDelete(person)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <X size={10} />
                </button>
                {/* History button */}
                <button
                  onClick={() => setHistoryPerson(person)}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <Clock size={10} />
                </button>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-700 truncate max-w-[64px]">{person.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} />}

      {selectedPerson && (
        <EditMemberModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onUpdate={async (id, name, icon) => {
            await updatePerson(id, name, icon)
            setSelectedPerson(null)
          }}
        />
      )}

      {historyPerson && (
        <PersonHistoryModal
          person={historyPerson}
          onClose={() => setHistoryPerson(null)}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <Avatar name={confirmDelete.name} icon={confirmDelete.icon} />
            <h3 className="font-bold text-gray-800 mt-3">Remove "{confirmDelete.name}"?</h3>
            <p className="text-sm text-gray-400 mt-1">Their payment records will remain.</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border rounded-xl py-2.5 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => { await deletePerson(confirmDelete.id); setConfirmDelete(null) }}
                className="flex-1 bg-red-400 hover:bg-red-500 text-white rounded-xl py-2.5 font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
