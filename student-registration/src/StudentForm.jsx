import { useState, useEffect } from 'react'
import './StudentForm.css'

const initial = {
  fullName: '', regNo: '', dob: '', gender: '',
  email: '', phone: '', department: '', year: '',
  guardianName: '', guardianPhone: '', address: '',
}

const departments = ['ISE', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI & DS']
const phoneRule = /^[6-9]\d{9}$/

const load = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function Field({ label, error, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error && <span className="error">{error}</span>}
    </div>
  )
}

export default function StudentForm() {
  const [form, setForm] = useState(() => load('draftForm', initial))
  const [students, setStudents] = useState(() => load('students', []))
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    localStorage.setItem('draftForm', JSON.stringify(form))
  }, [form])

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students))
  }, [students])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
    setMessage('')
  }

  const validate = () => {
    const err = {}
    if (!form.fullName.trim()) err.fullName = 'Full name is required'
    if (!form.regNo.trim()) err.regNo = 'Register number is required'
    else if (students.some((s) => s.regNo.toLowerCase() === form.regNo.trim().toLowerCase()))
      err.regNo = 'This register number is already registered'
    if (!form.dob) err.dob = 'Date of birth is required'
    if (!form.gender) err.gender = 'Select gender'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = 'Enter a valid email'
    if (!phoneRule.test(form.phone)) err.phone = 'Enter a valid 10-digit mobile number'
    if (!form.department) err.department = 'Select department'
    if (!form.year) err.year = 'Select year'
    if (!form.guardianName.trim()) err.guardianName = 'Guardian name is required'
    if (!phoneRule.test(form.guardianPhone)) err.guardianPhone = 'Enter a valid 10-digit mobile number'
    if (!form.address.trim()) err.address = 'Address is required'
    return err
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = validate()
    if (Object.keys(err).length > 0) {
      setErrors(err)
      setMessage('')
      return
    }
    setStudents([{ id: Date.now(), ...form }, ...students])
    setForm(initial)
    setErrors({})
    setMessage('Student registered successfully ✔')
  }

  const handleReset = () => {
    setForm(initial)
    setErrors({})
    setMessage('')
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this student?')) {
      setStudents(students.filter((s) => s.id !== id))
    }
  }

  const filtered = students.filter((s) =>
    (s.fullName + s.regNo + s.department)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="layout">
        {/* LEFT: FORM */}
        <form className="card form-card" onSubmit={handleSubmit} noValidate>
          <h1>Student Registration</h1>
          <p className="sub">Fill in all the details below</p>
          {message && <div className="success-msg">{message}</div>}

          <h3>Personal Details</h3>
          <div className="grid">
            <Field label="Full Name" error={errors.fullName}>
              <input name="fullName" value={form.fullName} onChange={handleChange} />
            </Field>
            <Field label="Register Number" error={errors.regNo}>
              <input name="regNo" value={form.regNo} onChange={handleChange} />
            </Field>
            <Field label="Date of Birth" error={errors.dob}>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} />
            </Field>
            <Field label="Gender" error={errors.gender}>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Email" error={errors.email}>
              <input type="email" name="email" value={form.email} onChange={handleChange} />
            </Field>
            <Field label="Mobile Number" error={errors.phone}>
              <input name="phone" maxLength="10" value={form.phone} onChange={handleChange} />
            </Field>
          </div>

          <h3>Academic Details</h3>
          <div className="grid">
            <Field label="Department" error={errors.department}>
              <select name="department" value={form.department} onChange={handleChange}>
                <option value="">Select</option>
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Year" error={errors.year}>
              <select name="year" value={form.year} onChange={handleChange}>
                <option value="">Select</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </Field>
          </div>

          <h3>Guardian & Address</h3>
          <div className="grid">
            <Field label="Guardian Name" error={errors.guardianName}>
              <input name="guardianName" value={form.guardianName} onChange={handleChange} />
            </Field>
            <Field label="Guardian Mobile" error={errors.guardianPhone}>
              <input name="guardianPhone" maxLength="10" value={form.guardianPhone} onChange={handleChange} />
            </Field>
          </div>
          <Field label="Address" error={errors.address}>
            <textarea name="address" rows="3" value={form.address} onChange={handleChange} />
          </Field>

          <div className="actions">
            <button type="button" className="btn secondary" onClick={handleReset}>
              Reset
            </button>
            <button type="submit" className="btn">Register</button>
          </div>
        </form>

        {/* RIGHT: STUDENT LIST */}
        <div className="card list-card">
          <h2>Registered Students ({students.length})</h2>
          <input
            className="search"
            placeholder="Search by name, reg no or department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filtered.length === 0 ? (
            <p className="empty">No students found.</p>
          ) : (
            <div className="student-list">
              {filtered.map((s) => (
                <div className="student" key={s.id}>
                  <div className="student-top">
                    <div>
                      <h4>{s.fullName}</h4>
                      <span className="tag">{s.regNo}</span>
                      <span className="tag blue">{s.department} · {s.year}</span>
                    </div>
                    <button className="delete" onClick={() => handleDelete(s.id)}>
                      Delete
                    </button>
                  </div>
                  <p><b>DOB:</b> {s.dob} &nbsp; <b>Gender:</b> {s.gender}</p>
                  <p><b>Email:</b> {s.email}</p>
                  <p><b>Mobile:</b> {s.phone}</p>
                  <p><b>Guardian:</b> {s.guardianName} ({s.guardianPhone})</p>
                  <p><b>Address:</b> {s.address}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}