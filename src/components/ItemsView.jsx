import { useState } from 'react'
import { Plus, X, Tag } from 'lucide-react'
import { useItems } from '../hooks/useItems'

export default function ItemsView() {
  const { items, loading, addItem, deleteItem } = useItems()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    await addItem(newName)
    setSaving(false)
    setNewName('')
    setShowAdd(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">ประเภทรายการ</h2>
          <p className="text-sm text-gray-400">{items.length} รายการ</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          เพิ่มประเภท
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">ยังไม่มีประเภทรายการ</div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border px-4 py-3 flex items-center gap-3 group">
              <div className="bg-amber-100 text-amber-600 rounded-xl p-2">
                <Tag size={16} />
              </div>
              <span className="flex-1 font-medium text-gray-700">{item.name}</span>
              <button
                onClick={() => setConfirmDelete(item)}
                className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">เพิ่มประเภทใหม่</h3>
              <button onClick={() => { setShowAdd(false); setNewName('') }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <input
                autoFocus
                type="text"
                placeholder="เช่น ค่าอาหาร, ค่าน้ำมัน"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={saving || !newName.trim()}
                className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl py-2.5 font-medium transition-colors disabled:opacity-40"
              >
                {saving ? 'กำลังบันทึก...' : 'เพิ่ม'}
              </button>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="bg-red-100 text-red-500 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
              <Tag size={24} />
            </div>
            <h3 className="font-bold text-gray-800">ลบ "{confirmDelete.name}"?</h3>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border rounded-xl py-2.5 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={async () => { await deleteItem(confirmDelete.id); setConfirmDelete(null) }}
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
