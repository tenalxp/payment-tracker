import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePeople() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from('people')
          .select('id, name, icon')
          .order('name')
        setPeople(data || [])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const addPerson = async (name, icon = 'ghost') => {
    const trimmed = name.trim()
    if (!trimmed) return null
    const { data, error } = await supabase
      .from('people')
      .insert([{ name: trimmed, icon }])
      .select()
      .single()
    if (!error) setPeople(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return error
  }

  const deletePerson = async (id) => {
    const { error } = await supabase.from('people').delete().eq('id', id)
    if (!error) setPeople(prev => prev.filter(p => p.id !== id))
    return error
  }

  const updatePerson = async (id, name, icon) => {
    const trimmed = name.trim()
    if (!trimmed) return null

    // get old name first
    const oldPerson = (await supabase.from('people').select('name').eq('id', id).single()).data

    const { data, error } = await supabase
      .from('people')
      .update({ name: trimmed, icon })
      .eq('id', id)
      .select()
      .single()

    if (!error) {
      setPeople(prev => prev.map(p => p.id === id ? data : p).sort((a, b) => a.name.localeCompare(b.name)))
      // always sync name in coffee_entries (case-insensitive match)
      if (oldPerson) {
        await supabase
          .from('coffee_entries')
          .update({ name: trimmed })
          .ilike('name', oldPerson.name)
      }
    }
    return error
  }

  return { people, loading, addPerson, deletePerson, updatePerson }
}
