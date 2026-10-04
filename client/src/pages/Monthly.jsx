import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import DiaryPaper from '../components/DiaryPaper'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import { api, request } from '../lib/api'

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

function duration(sec) {
  sec = Math.floor(sec || 0)
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)

  return h ? `${h}h ${m}m` : m ? `${m}m` : `${sec}s`
}

export default function Monthly() {
  const [month, setMonth] = useState(new Date())
  const [stats, setStats] = useState({ days: {} })
  const [selected, setSelected] = useState(null)
  const [daily, setDaily] = useState(null)
  const [type, setType] = useState('tasks')
  const [form, setForm] = useState({})
  const [toast, setToast] = useState('')

  const days = useMemo(() => {
    const y = month.getFullYear()
    const m = month.getMonth()

    const first = new Date(y, m, 1).getDay()
    const offset = (first + 6) % 7
    const total = new Date(y, m + 1, 0).getDate()

    return [
      ...Array(offset).fill(null),
      ...Array.from({ length: total }, (_, i) => new Date(y, m, i + 1)),
    ]
  }, [month])

  // FIXED: useEffect itself is NOT async
  useEffect(() => {
    let cancelled = false

    async function loadMonthly() {
      try {
        const data = await request(
          api.get('/diary/monthly', {
            params: {
              year: month.getFullYear(),
              month: month.getMonth() + 1,
            },
          })
        )

        if (!cancelled) {
          setStats(data)
        }
      } catch (e) {
        if (!cancelled) {
          setToast(e.message)
        }
      }
    }

    loadMonthly()

    return () => {
      cancelled = true
    }
  }, [month])

  const reloadMonthly = async () => {
    try {
      const data = await request(
        api.get('/diary/monthly', {
          params: {
            year: month.getFullYear(),
            month: month.getMonth() + 1,
          },
        })
      )

      setStats(data)
    } catch (e) {
      setToast(e.message)
    }
  }

  const openDate = async (d) => {
    const date = iso(d)

    try {
      setSelected(date)

      const data = await request(
        api.get('/diary/daily', {
          params: { date },
        })
      )

      setDaily(data)
    } catch (e) {
      setToast(e.message)
    }
  }

  const add = (t) => {
    setType(t)

    if (t === 'tasks') {
      setForm({
        name: '',
        description: '',
        priority: 'normal',
        due_time: '',
      })
    } else if (t === 'schedule') {
      setForm({
        time: '09:00',
        activity: '',
        subject: '',
        notes: '',
      })
    } else {
      setForm({
        goal: '',
        target: '',
        progress: 0,
        status: 'in-progress',
      })
    }
  }

  const save = async () => {
    try {
      await request(
        api.post(`/diary/${type}`, {
          ...form,
          date: selected,
        })
      )

      const updatedDaily = await request(
        api.get('/diary/daily', {
          params: { date: selected },
        })
      )

      setDaily(updatedDaily)
      await reloadMonthly()

      setForm({})
      setToast('Saved to the calendar date.')
    } catch (e) {
      setToast(e.message)
    }
  }

  const del = async (t, id) => {
    if (!confirm('Delete this entry?')) return

    try {
      const url =
        t === 'schedule'
          ? 'schedules'
          : t === 'tasks'
          ? 'tasks'
          : 'goals'

      await request(api.delete(`/diary/${url}/${id}`))

      const updatedDaily = await request(
        api.get('/diary/daily', {
          params: { date: selected },
        })
      )

      setDaily(updatedDaily)
      await reloadMonthly()
    } catch (e) {
      setToast(e.message)
    }
  }

  return (
    <DiaryPaper
      title={month.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })}
      page="03"
    >
      <div className="calendar-toolbar">
        <button
          className="small-btn"
          onClick={() =>
            setMonth(
              new Date(month.getFullYear(), month.getMonth() - 1, 1)
            )
          }
        >
          ←
        </button>

        <strong>
          {month.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          })}
        </strong>

        <button
          className="small-btn"
          onClick={() =>
            setMonth(
              new Date(month.getFullYear(), month.getMonth() + 1, 1)
            )
          }
        >
          →
        </button>
      </div>

      <div className="calendar">
        <div className="weekday-row">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {days.map((d, i) =>
            d ? (
              <button
                className={`date-cell ${
                  iso(d) === iso(new Date()) ? 'today' : ''
                }`}
                key={i}
                onClick={() => openDate(d)}
              >
                <b>{d.getDate()}</b>

                <span>
                  {stats.days?.[d.getDate()]?.tasks || 0} tasks
                </span>

                <span>
                  {duration(stats.days?.[d.getDate()]?.seconds || 0)}
                </span>
              </button>
            ) : (
              <div key={i} />
            )
          )}
        </div>
      </div>

      <div className="month-stats">
        {[
          ['Tasks', stats.totalTasks || 0],
          ['Completed', stats.completedTasks || 0],
          ['Study', duration(stats.totalSeconds || 0)],
          ['Goals', `${stats.goalRate || 0}%`],
        ].map((x) => (
          <div key={x[0]}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
          </div>
        ))}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Plan ${selected || ''}`}
      >
        <div className="calendar-entry-tabs">
          <button
            className={type === 'tasks' ? 'active' : ''}
            onClick={() => add('tasks')}
          >
            Task
          </button>

          <button
            className={type === 'schedule' ? 'active' : ''}
            onClick={() => add('schedule')}
          >
            Schedule
          </button>

          <button
            className={type === 'goals' ? 'active' : ''}
            onClick={() => add('goals')}
          >
            Goal
          </button>
        </div>

        <div className="calendar-existing">
          {daily?.schedule?.map((s) => (
            <div key={`s${s.id}`}>
              <b>{s.time}</b>
              <span>{s.activity}</span>

              <button onClick={() => del('schedule', s.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {daily?.tasks?.map((t) => (
            <div key={`t${t.id}`}>
              <b>{t.completed ? '✓' : '○'}</b>
              <span>{t.name}</span>

              <button onClick={() => del('tasks', t.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {daily?.goals?.map((g) => (
            <div key={`g${g.id}`}>
              <b>Goal</b>
              <span>{g.goal}</span>

              <button onClick={() => del('goals', g.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {!daily?.schedule?.length &&
            !daily?.tasks?.length &&
            !daily?.goals?.length && (
              <small className="muted">
                Nothing planned for this date yet.
              </small>
            )}
        </div>

        <div className="form-stack">
          {type === 'tasks' && (
            <>
              <label>
                Task
                <input
                  value={form.name || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Description
                <input
                  value={form.description || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </label>
            </>
          )}

          {type === 'schedule' && (
            <>
              <label>
                Time
                <input
                  type="time"
                  value={form.time || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      time: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Activity
                <input
                  value={form.activity || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      activity: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Subject
                <input
                  value={form.subject || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subject: e.target.value,
                    })
                  }
                />
              </label>
            </>
          )}

          {type === 'goals' && (
            <>
              <label>
                Goal
                <input
                  value={form.goal || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      goal: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Target
                <input
                  value={form.target || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      target: e.target.value,
                    })
                  }
                />
              </label>
            </>
          )}

          <button className="primary wide" onClick={save}>
            <Plus size={15} />
            Add to this date
          </button>
        </div>
      </Modal>

      <Toast
        message={toast}
        onDone={() => setToast('')}
      />
    </DiaryPaper>
  )
}