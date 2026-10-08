export const CATEGORIES = [
  { id: 'food', name: 'Food', color: '#F59E0B', icon: 'food' },
  { id: 'transport', name: 'Transport', color: '#3B82F6', icon: 'transport' },
  { id: 'airtime', name: 'Airtime', color: '#A855F7', icon: 'airtime' },
  { id: 'rent', name: 'Rent', color: '#14B8A6', icon: 'rent' },
  { id: 'shopping', name: 'Shopping', color: '#EC4899', icon: 'shopping' },
  { id: 'health', name: 'Health', color: '#EF4444', icon: 'health' },
  { id: 'school', name: 'School', color: '#84CC16', icon: 'school' },
]

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id)
