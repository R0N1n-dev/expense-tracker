import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeAll, describe, expect, it } from 'vitest'
import App from './App.vue'
import { loadStore, exportCSV, importCSVText } from './composables/useExpenses'
import { loadTheme } from './composables/useTheme'

const pause = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms))
const allButtons = () => [...document.querySelectorAll('button')]
const button = (label) =>
  allButtons().find(
    (b) =>
      (b.getAttribute('aria-label') || '') === label ||
      b.textContent.replace(/\s+/g, ' ').trim() === label,
  )
const findButton = (needle) =>
  allButtons().find(
    (b) =>
      (b.getAttribute('aria-label') || '').includes(needle) ||
      b.textContent.includes(needle),
  )
const input = (label) => document.querySelector(`[aria-label="${label}"]`)

async function click(label) {
  const target = button(label) ?? findButton(label)
  expect(target, `button "${label}"`).toBeTruthy()
  target.click()
  await nextTick()
  await pause()
  await nextTick()
}

async function fill(label, value) {
  const el = input(label)
  expect(el, `input "${label}"`).toBeTruthy()
  el.value = value
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
  await nextTick()
}

describe('Nsimbi app', () => {
  beforeAll(async () => {
    localStorage.clear()
    await Promise.all([loadStore(), loadTheme()])
    mount(App, { attachTo: document.body })
    await pause()
  })

  it('adds an expense and shows the budget maths', async () => {
    await click('Add entry')
    await click('5')
    await click('000')
    await fill('Note', 'Lunch at cafe')
    await click('Save expense')
    await pause(50)

    expect(document.querySelector('.amt').textContent).toContain('5,000')
    expect(document.querySelector('.list').textContent).toContain('Lunch at cafe')
  })

  it('tracks income separately from spending', async () => {
    await click('Add entry')
    await click('Income')
    await click('9')
    await click('000')
    await click('Salary')
    await click('Save income')
    await pause(50)

    const stats = document.querySelector('.stats').textContent
    expect(stats).toContain('+9,000')
    expect(document.querySelector('.amt').textContent).toContain('5,000')
  })

  it('deletes with a working undo', async () => {
    document.querySelector('.row').click()
    await nextTick()
    await pause()
    await click('Delete')
    await click('Tap again')
    await pause(50)

    expect(document.querySelector('.toast').textContent).toContain('Entry deleted.')
    await click('Undo')
    await pause(50)
    expect(document.querySelector('.list').textContent).toContain('Lunch at cafe')
  })

  it('navigates months without passing the present', async () => {
    const thisMonth = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    await click('Previous month')
    const shown = document.querySelector('.lbl b').textContent
    expect(shown).not.toBe(thisMonth)
    await click('Back to this month')
    expect(document.querySelector('.lbl b').textContent).toBe(thisMonth)
  })

  it('filters by text and clears the filter', async () => {
    const search = document.querySelector('input[aria-label="Search entries"]')
    search.value = 'lunch'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    expect(document.querySelector('.active-row').textContent).toContain('1 result')
    expect(document.querySelector('.list').textContent).toContain('Lunch at cafe')
    await click('Clear')
    expect(document.querySelector('.active-row')).toBeNull()
  })

  it('shows insights with a safe daily allowance', async () => {
    await click('Insights')
    const dialog = [...document.querySelectorAll('[role="dialog"]')].find(
      (d) => d.getAttribute('aria-hidden') === 'false',
    )
    expect(dialog.textContent).toContain('Safe daily spend')
    expect(dialog.textContent).toContain('Last 6 months')
    dialog.querySelector('[aria-label="Close"]').click()
    await nextTick()
    await pause()
  })

  it('creates category limits, goals and recurring entries', async () => {
    await click('Plan budgets, goals and recurring entries')

    findButton('Limits').click()
    await nextTick()
    await pause()
    input('Category').value = 'food'
    input('Category').dispatchEvent(new Event('change', { bubbles: true }))
    await fill('Limit in UGX', '50000')
    await click('Set')
    expect(document.body.textContent).toContain('50,000')

    findButton('Goals').click()
    await nextTick()
    await fill('Goal name', 'Laptop fund')
    await fill('Target amount', '2000000')
    await click('Create goal')
    expect(document.body.textContent).toContain('Laptop fund')
    expect(document.body.textContent).toContain('2,000,000')

    findButton('Repeat').click()
    await nextTick()
    await click('New recurring entry')
    const repeat = [...document.querySelectorAll('select')].at(-1)
    expect(repeat.value).toBe('monthly')
    const open = [...document.querySelectorAll('[role="dialog"]')].find(
      (d) => d.getAttribute('aria-hidden') === 'false',
    )
    open.querySelector('[aria-label="Close"]').click()
    await nextTick()
    await pause()
  })

  it('switches colour themes and appearance, and persists them', async () => {
    await click('Settings, themes and backup')
    await click('Cyber High-Contrast')
    await click('Dark')
    await pause()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme-id')).toBe('cyber')
    expect(localStorage.getItem('CapacitorStorage.themeId')).toContain('cyber')

    const open = [...document.querySelectorAll('[role="dialog"]')].find(
      (d) => d.getAttribute('aria-hidden') === 'false',
    )
    open.querySelector('[aria-label="Close"]').click()
    await nextTick()
    await pause()
  })

  it('exports and re-imports CSV without losing the shape', () => {
    const csv = exportCSV()
    expect(csv.split('\n')[0]).toBe('date,type,category,note,amount')
    expect(csv).toContain('Lunch at cafe')

    const counts = importCSVText(
      'date,type,category,note,amount\n2026-10-20,expense,Food,"Rice, beans",12000',
    )
    expect(counts.items).toBe(1)
    const roundTrip = exportCSV()
    expect(roundTrip).toContain('"Rice, beans"')
    expect(roundTrip).toContain('12000')
  })
})
