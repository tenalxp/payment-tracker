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
          .select('id, name')
          .order('name')
        setPeople(data || [])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const addPerson = async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return null
    const { data, error } = await supabase
      .from('people')
      .insert([{ name: trimmed }])
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

  return { people, loading, addPerson, deletePerson }
}
