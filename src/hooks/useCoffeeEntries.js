import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCoffeeEntries(date) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('coffee_entries')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }, [date])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const addEntry = async (entry) => {
    const { data, error } = await supabase
      .from('coffee_entries')
      .insert([{ ...entry, date }])
      .select()
      .single()
    if (!error) setEntries(prev => [data, ...prev])
    return error
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('coffee_entries')
      .update({ status })
      .eq('id', id)
    if (!error) setEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
    return error
  }

  const deleteEntry = async (id) => {
    const { error } = await supabase
      .from('coffee_entries')
      .delete()
      .eq('id', id)
    if (!error) setEntries(prev => prev.filter(e => e.id !== id))
    return error
  }

  return { entries, loading, addEntry, updateStatus, deleteEntry, refetch: fetchEntries }
}

export function usePendingByPerson() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: rows } = await supabase
      .from('coffee_entries')
      .select('*')
      .eq('status', 'pending')
      .order('date', { ascending: false })

    // group by person
    const map = {}
    for (const row of rows || []) {
      if (!map[row.name]) map[row.name] = { name: row.name, latestDate: row.date, totals: {} }
      const cur = row.currency || '฿'
      map[row.name].totals[cur] = (map[row.name].totals[cur] || 0) + row.price
    }
    setData(Object.values(map))
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, refetch: fetch }
}

export function useMonthlyEntries(year, month) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMonthly = async () => {
      setLoading(true)
      const from = `${year}-${String(month).padStart(2, '0')}-01`
      const to = `${year}-${String(month).padStart(2, '0')}-31`
      const { data } = await supabase
        .from('coffee_entries')
        .select('*')
        .gte('date', from)
        .lte('date', to)
        .order('date', { ascending: false })
      setEntries(data || [])
      setLoading(false)
    }
    fetchMonthly()
  }, [year, month])

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('coffee_entries')
      .update({ status })
      .eq('id', id)
    if (!error) setEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
  }

  return { entries, loading, updateStatus }
}
