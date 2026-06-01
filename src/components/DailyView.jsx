import { useState } from 'react'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCoffeeEntries } from '../hooks/useCoffeeEntries'
import AddEntryForm from './AddEntryForm'
import EntryCard from './EntryCard'

export default function DailyView() {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const { entries, loading, addEntry, updateStatus, deleteEntry } = useCoffeeEntries(date)

  const prevDay = () => setDate(d => dayjs(d).subtract(1, 'day').format('YYYY-MM-DD'))
  const nextDay = () => setDate(d => dayjs(d).add(1, 'day').format('YYYY-MM-DD'))
  const isToday = date === dayjs().format('YYYY-MM-DD')

  const total = entries.reduce((sum, e) => sum + e.price, 0)
  const pending = entries.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.price, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Date navigator */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
        <button onClick={prevDay} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <div className="font-bold text-gray-800 text-lg">
            {dayjs(date).format('D MMMM YYYY')}
          </div>
          {isToday && <div className="text-xs text-amber-500 font-medium">วันนี้</div>}
        </div>
        <button
          onClick={nextDay}
          disabled={isToday}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary chips */}
      {entries.length > 0 && (
        <div className="flex gap-3">
          <div className="flex-1 bg-amber-500 text-white rounded-2xl p-3 text-center">
            <div className="text-xs opacity-80">รวมทั้งหมด</div>
            <div className="font-bold text-lg">฿{total.toFixed(0)}</div>
          </div>
          <div className="flex-1 bg-red-400 text-white rounded-2xl p-3 text-center">
            <div className="text-xs opacity-80">ค้างจ่าย</div>
            <div className="font-bold text-lg">฿{pending.toFixed(0)}</div>
          </div>
          <div className="flex-1 bg-green-400 text-white rounded-2xl p-3 text-center">
            <div className="text-xs opacity-80">จ่ายแล้ว</div>
            <div className="font-bold text-lg">฿{(total - pending).toFixed(0)}</div>
          </div>
        </div>
      )}

      {/* Entry list */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-gray-400">ยังไม่มีรายการวันนี้</div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onStatusChange={updateStatus}
              onDelete={deleteEntry}
            />
          ))}
        </div>
      )}

      <AddEntryForm onAdd={addEntry} />
    </div>
  )
}
