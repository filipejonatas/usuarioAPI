'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { userApi, User } from '../service/api'
import { Users, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'

export default function CadastroPage() {
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

  // Cancelar edição
  const cancelEdit = () => {
    setEditingUser(null)
    setShowForm(false)
    reset()
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </button>
            </div>
          </div>

          {/* Formulário */}
          {showForm && (
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">E-mail</label>
                      <input
                        {...register('email', { required: true })}
                        type="email"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="usuario@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <input
                        {...register('name')}
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nome do usuário"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Função</label>
                      <select
                        {...register('role')}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecione uma função</option>
                        <option value="User">Usuário</option>
                        <option value="Admin">Administrador</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingUser ? 'Atualizar' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lista de Usuários */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Usuários Cadastrados
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando usuários...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.Id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {user.name || 'Nome não informado'}
                              </h4>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'Admin' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role || 'Usuário'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
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
      </div>
    </ProtectedRoute>
  )
}