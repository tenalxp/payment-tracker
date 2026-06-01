import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('items')
        .select('id, name')
        .order('name')
      setItems(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const addItem = async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return null
    const { data, error } = await supabase
      .from('items')
      .insert([{ name: trimmed }])
      .select()
      .single()
    if (!error) setItems(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name, 'th')))
    return error
  }

  const deleteItem = async (id) => {
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (!error) setItems(prev => prev.filter(i => i.id !== id))
    return error
  }

  return { items, loading, addItem, deleteItem }
}
