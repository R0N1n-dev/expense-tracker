// Categories used for expenses and income. Every category carries the colour
// used by charts, badges and the widget.
const EXPENSE = [
  { id: 'food', name: 'Food', color: '#F59E0B', icon: 'food' },
  { id: 'transport', name: 'Transport', color: '#3B82F6', icon: 'transport' },
  { id: 'airtime', name: 'Airtime', color: '#A855F7', icon: 'airtime' },
  { id: 'rent', name: 'Rent', color: '#14B8A6', icon: 'rent' },
  { id: 'shopping', name: 'Shopping', color: '#EC4899', icon: 'shopping' },
  { id: 'health', name: 'Health', color: '#EF4444', icon: 'health' },
  { id: 'school', name: 'School', color: '#84CC16', icon: 'school' },
  { id: 'bills', name: 'Bills', color: '#F97316', icon: 'bolt' },
  { id: 'fun', name: 'Fun', color: '#8B5CF6', icon: 'sparkles' },
  { id: 'family', name: 'Family', color: '#06B6D4', icon: 'family' },
  { id: 'savings', name: 'Savings', color: '#10B981', icon: 'target' },
  { id: 'other', name: 'Other', color: '#64748B', icon: 'wallet' },
].map((c) => ({ ...c, type: 'expense' }))

const INCOME = [
  { id: 'salary', name: 'Salary', color: '#10B981', icon: 'wallet' },
  { id: 'business', name: 'Business', color: '#0EA5E9', icon: 'briefcase' },
  { id: 'freelance', name: 'Freelance', color: '#8B5CF6', icon: 'laptop' },
  { id: 'gift', name: 'Gift', color: '#EC4899', icon: 'gift' },
  { id: 'other-income', name: 'Other', color: '#64748B', icon: 'plus' },
].map((c) => ({ ...c, type: 'income' }))

export const EXPENSE_CATEGORIES = EXPENSE
export const INCOME_CATEGORIES = INCOME
export const CATEGORIES = [...EXPENSE, ...INCOME]

const BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]))

export const categoryById = (id) => BY_ID.get(id) ?? EXPENSE[EXPENSE.length - 1]

export const categoriesFor = (type) =>
  type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

export const categoryByName = (name) => {
  const needle = String(name ?? '').trim().toLowerCase()
  return CATEGORIES.find((c) => c.name.toLowerCase() === needle || c.id === needle)
}
