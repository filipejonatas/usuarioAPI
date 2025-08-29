'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { userApi, User } from '../app/service/api'
import { Users, Plus, Edit, Trash2, Save, X } from 'lucide-react'

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { register, handleSubmit, reset, setValue } = useForm<Omit<User, 'Id'>>()

  // Carregar usuários
  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await userApi.getAll()
      setUsers(data)
    } catch (error) {
      alert('Erro ao carregar usuários')
    }
    setLoading(false)
  }

  // Criar/Editar usuário
  const onSubmit = async (data: Omit<User, 'Id'>) => {
    try {
      if (editingUser) {
        await userApi.update(editingUser.Id, data)
        alert('Usuário atualizado!')
      } else {
        await userApi.create(data)
        alert('Usuário criado!')
      }
      reset()
      setEditingUser(null)
      setShowForm(false)
      loadUsers()
    } catch (error) {
      alert('Erro ao salvar usuário')
    }
  }

  // Deletar usuário
  const deleteUser = async (id: number) => {
    if (confirm('Deletar usuário?')) {
      try {
        await userApi.delete(id)
        alert('Usuário deletado!')
        loadUsers()
      } catch (error) {
        alert('Erro ao deletar usuário')
      }
    }
  }

  // Editar usuário
  const editUser = (user: User) => {
    setEditingUser(user)
    setValue('email', user.email)
    setValue('name', user.name || '')
    setValue('role', user.role || '')
    setShowForm(true)
  }

  // Novo usuário
  const newUser = () => {
    setEditingUser(null)
    reset()
    setShowForm(true)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="mr-2" />
                Gerenciar Usuários
              </h1>
              <p className="text-gray-600 mt-1">{users.length} usuários</p>
            </div>
            <button
              onClick={newUser}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </button>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', { required: true })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função
                </label>
                <select
                  {...register('role')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="user">Usuário</option>
                  <option value="moderator">Moderador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Usuários */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.Id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.name || 'Sem nome'}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.role && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                          {user.role}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editUser(user)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.Id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}