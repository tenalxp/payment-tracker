import { useState } from 'react'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMonthlyEntries } from '../hooks/useCoffeeEntries'
import { StatusBadge, StatusSelector } from './StatusBadge'

export default function MonthlyView() {
  const now = dayjs()
  const [year, setYear] = useState(now.year())
  const [month, setMonth] = useState(now.month() + 1)
  const { entries, loading, updateStatus } = useMonthlyEntries(year, month)

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  // Group by person
  const byPerson = entries.reduce((acc, e) => {
    if (!acc[e.name]) acc[e.name] = []
    acc[e.name].push(e)
    return acc
  }, {})

  const monthLabel = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('MMMM YYYY')

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigator */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="font-bold text-gray-800 text-lg">{monthLabel}</div>
        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-gray-400">ไม่มีข้อมูลเดือนนี้</div>
      ) : (
        Object.entries(byPerson).map(([name, items]) => {
          const total = items.reduce((s, e) => s + e.price, 0)
          const pending = items.filter(e => e.status === 'pending').reduce((s, e) => s + e.price, 0)
          return (
            <div key={name} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Person header */}
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-3 flex items-center justify-between text-white">
                <div className="font-bold text-lg">{name}</div>
                <div className="text-right">
                  <div className="text-xs opacity-80">ค้างจ่าย</div>
                  <div className="font-bold">฿{pending.toFixed(0)}</div>
                </div>
              </div>

              {/* Entries */}
              <div className="divide-y divide-gray-50">
                {items.map(entry => (
                  <div key={entry.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="text-xs text-gray-400 w-16 shrink-0">
                      {dayjs(entry.date).format('D MMM')}
                    </div>
                    <div className="flex-1 text-sm text-gray-700 truncate">
                      {entry.menu || '-'}
                    </div>
                    <div className="font-medium text-gray-800 text-sm shrink-0">
                      ฿{entry.price.toFixed(0)}
                    </div>
                    <StatusSelector
                      status={entry.status}
                      onChange={s => updateStatus(entry.id, s)}
                    />
                  </div>
                ))}
              </div>

              {/* Person footer */}
              <div className="bg-gray-50 px-4 py-2 flex justify-between text-sm text-gray-500">
                <span>{items.length} รายการ</span>
                <span>รวม ฿{total.toFixed(0)}</span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
