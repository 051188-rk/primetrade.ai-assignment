import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function TaskForm({ onTaskAdded }) {
  const [form, setForm] = useState({ title:'', description:'', tags:'' });
  const { user } = useAuth();
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks`, {
        title: form.title,
        description: form.description,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      }, { headers: { Authorization: `Bearer ${user.token}` }});
      setForm({ title:'', description:'', tags:'' });
      onTaskAdded();
    } catch (err) {
      console.error(err);
      alert('Failed to add task');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded space-y-3">
      <h3 className="text-xl font-semibold text-neon">Create Task</h3>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full p-2 bg-gray-700 rounded" required />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full p-2 bg-gray-700 rounded" />
      <input name="tags" value={form.tags} onChange={handleChange} placeholder="Tags (comma separated)" className="w-full p-2 bg-gray-700 rounded" />
      <button className="py-2 px-4 rounded btn-neon">Add Task</button>
    </form>
  );
}
