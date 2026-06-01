import { useState } from 'react'
import { Plus, X, UserPlus } from 'lucide-react'
import { usePeople } from '../hooks/usePeople'

export default function AddEntryForm({ onAdd }) {
  const { people, addPerson } = usePeople()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', menu: '', price: '' })
  const [addingNew, setAddingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSelectName = (e) => {
    const val = e.target.value
    if (val === '__new__') {
      setAddingNew(true)
      setForm(f => ({ ...f, name: '' }))
    } else {
      setForm(f => ({ ...f, name: val }))
    }
  }

  const confirmNewName = async () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    await addPerson(trimmed)
    setForm(f => ({ ...f, name: trimmed }))
    setNewName('')
    setAddingNew(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) return
    setLoading(true)
    const error = await onAdd({
      name: form.name.trim(),
      menu: form.menu.trim(),
      price: parseFloat(form.price),
      status: 'pending',
    })
    setLoading(false)
    if (!error) {
      setForm({ name: '', menu: '', price: '' })
      setAddingNew(false)
      setOpen(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setAddingNew(false)
    setNewName('')
    setForm({ name: '', menu: '', price: '' })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-amber-300 rounded-2xl py-4 flex items-center justify-center gap-2 text-amber-600 hover:bg-amber-50 transition-colors font-medium"
      >
        <Plus size={20} />
        เพิ่มรายการใหม่
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-amber-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">เพิ่มรายการใหม่</h3>
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        {/* Name selector */}
        {!addingNew ? (
          <select
            value={form.name}
            onChange={handleSelectName}
            className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            required
          >
            <option value="">เลือกชื่อคน *</option>
            {people.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
            <option value="__new__">➕ เพิ่มชื่อใหม่...</option>
          </select>
        ) : (
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="พิมพ์ชื่อใหม่"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), confirmNewName())}
              className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="button"
              onClick={confirmNewName}
              className="bg-amber-500 text-white px-3 rounded-xl hover:bg-amber-600 transition-colors"
            >
              <UserPlus size={16} />
            </button>
            <button
              type="button"
              onClick={() => { setAddingNew(false); setNewName('') }}
              className="text-gray-400 hover:text-gray-600 px-2"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {form.name && !addingNew && (
          <div className="text-xs text-amber-600 font-medium px-1">
            ✓ เลือก: {form.name}
          </div>
        )}

        <input
          type="text"
          placeholder="เมนู (เช่น ลาเต้เย็น)"
          value={form.menu}
          onChange={e => setForm(f => ({ ...f, menu: e.target.value }))}
          className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <input
          type="number"
          placeholder="ราคา (บาท) *"
          value={form.price}
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          min="0"
          step="0.5"
          required
        />
        <button
          type="submit"
          disabled={loading || !form.name || addingNew}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2 font-medium transition-colors disabled:opacity-40"
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </form>
    </div>
  )
}
