import { useState } from 'react'
import dayjs from 'dayjs'
import { Plus } from 'lucide-react'
import mascot from '../assets/mascot.png'
import { usePeople } from '../hooks/usePeople'
import { usePendingByPerson } from '../hooks/useCoffeeEntries'
import { Avatar } from './MembersView'
import AddDebtModal from './AddDebtModal'
import AddMemberModal from './AddMemberModal'
import PersonHistoryModal from './PersonHistoryModal'

export default function HomeView() {
  const { people } = usePeople()
  const { data: pendingPeople, loading, refetch } = usePendingByPerson()
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [historyPerson, setHistoryPerson] = useState(null)
  const [showAddMember, setShowAddMember] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: '#EEF0F5' }}>

      {/* Hero header */}
      <div className="relative overflow-hidden px-5 pt-12 pb-8"
        style={{ background: 'linear-gradient(160deg, #E8EEF5 0%, #EDF3F0 100%)' }}>

        {/* Blob decorations */}
        <div className="absolute -top-8 -right-8 w-44 h-44 rounded-full blur-2xl opacity-60"
          style={{ background: 'linear-gradient(135deg, #B8D8C8, #A8CCE0)' }} />
        <div className="absolute -bottom-6 left-8 w-32 h-32 rounded-full blur-2xl opacity-50"
          style={{ background: 'linear-gradient(135deg, #F0D8C0, #E8C8B0)' }} />
        <div className="absolute top-6 left-1/3 w-24 h-24 rounded-full blur-xl opacity-40"
          style={{ background: '#D4E8D8' }} />

        <div className="relative flex items-end justify-between">
          <img src={mascot} alt="" className="w-28 h-28 object-contain drop-shadow-lg shrink-0" />
          <div className="text-right">
            <p className="text-xs font-medium mb-0.5" style={{ color: '#8A9BAA' }}>
              {dayjs().format('ddd, D MMM YYYY')}
            </p>
            <p className="text-xs mb-2" style={{ color: '#8A9BAA' }}>Pending payments</p>
            <p className="text-5xl font-bold tracking-tight" style={{ color: '#2D3A48' }}>
              {pendingPeople.length}
            </p>
          </div>
        </div>
      </div>

      {/* Members card */}
      <div className="mx-4 -mt-4 relative z-10 rounded-3xl px-4 py-4"
        style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(100,120,140,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
          border: '1px solid rgba(255,255,255,0.8)'
        }}>
        <div className="flex items-start gap-4 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddMember(true)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #E8EEF5, #DDE5EE)',
                boxShadow: '4px 4px 8px rgba(100,120,140,0.15), -2px -2px 6px rgba(255,255,255,0.8)',
                color: '#8A9BAA',
                border: 'none'
              }}
            >
              <Plus size={18} />
            </button>
            <span className="text-[11px] font-medium" style={{ color: '#8A9BAA' }}>Add</span>
          </div>
          <div className="w-px self-stretch shrink-0 my-1" style={{ background: 'rgba(0,0,0,0.06)' }} />
          {people.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPerson(p)}
              className="flex flex-col items-center gap-2 shrink-0 active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden"
                style={{ boxShadow: '4px 4px 8px rgba(100,120,140,0.2), -2px -2px 6px rgba(255,255,255,0.9)' }}>
                <Avatar name={p.name} icon={p.icon} size="md" />
              </div>
              <span className="text-[11px] font-medium max-w-[48px] truncate" style={{ color: '#6A7D8E' }}>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Unpaid section */}
      <div className="px-4 mt-5 pb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold" style={{ color: '#2D3A48' }}>Unpaid</p>
          <span className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: 'rgba(255,255,255,0.8)', color: '#8A9BAA', boxShadow: '2px 2px 6px rgba(100,120,140,0.1)' }}>
            {pendingPeople.length} people
          </span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-sm" style={{ color: '#8A9BAA' }}>Loading...</div>
        ) : pendingPeople.length === 0 ? (
          <div className="rounded-3xl text-center py-10 px-4"
            style={{
              background: 'rgba(255,255,255,0.75)',
              boxShadow: '0 8px 24px rgba(100,120,140,0.1)',
              border: '1px solid rgba(255,255,255,0.9)'
            }}>
            <img src={mascot} alt="" className="w-24 h-24 mx-auto object-contain" />
            <p className="text-sm font-bold mt-2" style={{ color: '#2D3A48' }}>All cleared! 🎉</p>
            <p className="text-xs mt-1" style={{ color: '#8A9BAA' }}>No pending payments</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {pendingPeople.map(p => (
              <button
                key={p.name}
                onClick={() => setHistoryPerson({ name: p.name, icon: people.find(m => m.name === p.name)?.icon })}
                className="rounded-3xl p-4 text-left active:scale-95 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  boxShadow: '6px 6px 16px rgba(100,120,140,0.15), -2px -2px 8px rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.9)'
                }}
              >
                <div className="mb-3">
                  <Avatar name={p.name} icon={people.find(m => m.name === p.name)?.icon} size="sm" />
                </div>
                <p className="font-bold text-sm truncate mb-0.5" style={{ color: '#2D3A48' }}>{p.name}</p>
                <p className="text-[11px] mb-3" style={{ color: '#8A9BAA' }}>{dayjs(p.latestDate).format('D MMM YYYY')}</p>
                <div className="flex flex-col gap-0.5">
                  {Object.entries(p.totals).map(([cur, amt]) => (
                    <p key={cur} className="text-sm font-bold" style={{ color: '#E07060' }}>
                      -{cur}{amt.toLocaleString()}
                    </p>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPerson && (
        <AddDebtModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onSuccess={() => { setSelectedPerson(null); refetch() }}
        />
      )}
      {historyPerson && (
        <PersonHistoryModal
          person={historyPerson}
          onClose={() => setHistoryPerson(null)}
          onUpdate={refetch}
        />
      )}
      {showAddMember && <AddMemberModal onClose={() => setShowAddMember(false)} />}
    </div>
  )
}
