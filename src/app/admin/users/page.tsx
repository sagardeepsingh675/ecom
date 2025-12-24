'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

interface User {
    id: string
    email: string
    full_name: string | null
    phone: string | null
    role: string
    created_at: string
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) throw error
                setUsers(data || [])
            } catch (error) {
                console.error('Error fetching users:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    const toggleRole = async (id: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin'

        if (!confirm(`Change this user's role to ${newRole}?`)) return

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', id)

            if (error) throw error

            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u))
        } catch (error) {
            console.error('Error updating role:', error)
            alert('Failed to update role')
        }
    }

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Users</h2>
                    <p className="text-white/50">Manage registered users and roles</p>
                </div>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="form-input w-64"
                />
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-white/50 text-sm border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Phone</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="w-8 h-8 mx-auto border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'admin'
                                                        ? 'bg-gradient-to-br from-red-500 to-orange-600'
                                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                                    }`}>
                                                    {user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-white">{user.full_name || 'Unnamed'}</div>
                                                    <div className="text-white/50 text-xs">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-white/70">
                                            {user.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${user.role === 'admin' ? 'badge-error' : 'badge-primary'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/50">
                                            {formatDate(user.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleRole(user.id, user.role)}
                                                className="text-xs text-indigo-400 hover:text-indigo-300"
                                            >
                                                {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
