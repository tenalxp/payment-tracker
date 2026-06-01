import { useState } from 'react'
import { X } from 'lucide-react'
import { usePeople } from '../hooks/usePeople'
import { Avatar } from './MembersView'

export default function AddMemberModal({ onClose }) {
  const { addPerson } = usePeople()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await addPerson(name)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">เพิ่มสมาชิกใหม่</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {name.trim() && (
            <div className="flex justify-center">
              <Avatar name={name} />
            </div>
          )}
          <input
            autoFocus
            type="text"
            placeholder="ชื่อสมาชิก"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl py-2.5 font-medium transition-colors disabled:opacity-40"
          >
            {saving ? 'กำลังบันทึก...' : 'เพิ่มสมาชิก'}
          </button>
        </form>
      </div>
    </div>
  )
}
