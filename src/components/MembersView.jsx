import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { usePeople } from '../hooks/usePeople'
import AddDebtModal from './AddDebtModal'

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

function Avatar({ name, size = 'lg' }) {
  const color = getColor(name)
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'md' ? 'w-14 h-14 text-base' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-bold shadow-md select-none`}>
      {getInitials(name)}
    </div>
  )
}

export { Avatar, getColor, getInitials }

export default function MembersView() {
  const { people, loading, addPerson, deletePerson } = usePeople()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [selectedPerson, setSelectedPerson] = useState(null)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    const error = await addPerson(newName)
    setSaving(false)
    if (!error) {
      setNewName('')
      setShowAdd(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">สมาชิก</h2>
          <p className="text-sm text-gray-400">{people.length} คน</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
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
              <div className="text-xs font-medium text-gray-600">เพิ่ม</div>
              <div className="text-xs text-gray-400">สมาชิก</div>
            </div>
          </div>

          {/* Member cards */}
          {people.map(person => (
            <div key={person.id} className="flex flex-col items-center gap-2 group relative">
              <div className="relative">
                <button onClick={() => setSelectedPerson(person)} className="focus:outline-none">
                  <Avatar name={person.name} />
                </button>
                <button
                  onClick={() => setConfirmDelete(person)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <X size={10} />
                </button>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-700 truncate max-w-[64px]">{person.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">เพิ่มสมาชิกใหม่</h3>
              <button onClick={() => { setShowAdd(false); setNewName('') }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              {newName.trim() && (
                <div className="flex justify-center">
                  <Avatar name={newName} />
                </div>
              )}
              <input
                autoFocus
                type="text"
                placeholder="ชื่อสมาชิก"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={saving || !newName.trim()}
                className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl py-2.5 font-medium transition-colors disabled:opacity-40"
              >
                {saving ? 'กำลังบันทึก...' : 'เพิ่มสมาชิก'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {selectedPerson && (
        <AddDebtModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <Avatar name={confirmDelete.name} />
            <h3 className="font-bold text-gray-800 mt-3">ลบ "{confirmDelete.name}"?</h3>
            <p className="text-sm text-gray-400 mt-1">ข้อมูลรายการกาแฟของคนนี้จะยังอยู่</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border rounded-xl py-2.5 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={async () => { await deletePerson(confirmDelete.id); setConfirmDelete(null) }}
                className="flex-1 bg-red-400 hover:bg-red-500 text-white rounded-xl py-2.5 font-medium transition-colors"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
