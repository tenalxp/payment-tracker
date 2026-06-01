import { Trash2, Coffee } from 'lucide-react'
import { StatusSelector } from './StatusBadge'
import { Avatar } from './MembersView'

export default function EntryCard({ entry, onStatusChange, onDelete }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-3 transition-all ${
      entry.status !== 'pending' ? 'opacity-60' : ''
    }`}>
      <div className="shrink-0">
        <Avatar name={entry.name} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 truncate">{entry.name}</div>
        {entry.menu && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Coffee size={11} /> {entry.menu}
          </div>
        )}
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <div className="font-bold text-gray-800">฿{entry.price.toFixed(0)}</div>
        <StatusSelector status={entry.status} onChange={s => onStatusChange(entry.id, s)} />
      </div>
      <button
        onClick={() => onDelete(entry.id)}
        className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
