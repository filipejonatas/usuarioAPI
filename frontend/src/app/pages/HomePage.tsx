'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Home, Users, LogOut, Settings, Shield } from 'lucide-react'

export default function HomePage() {
  const { user, logout, isAdmin } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navigateToUserManagement = () => {
    if (isAdmin) {
      router.push('/admin/users')
    } else {
      alert('Acesso negado. Apenas administradores podem acessar esta página.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/home')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Home className="h-4 w-4 mr-2" />
                Início
              </button>
              <button
                onClick={() => router.push('/users')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </button>
              {isAdmin && (
                <button
                  onClick={() => router.push('/admin/users')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Gerenciar
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-700">
                  Olá, <span className="font-medium">{user?.name || user?.email}</span>
                </div>
                {isAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Bem-vindo ao Sistema!
            </h2>
            <p className="text-lg text-gray-600">
              Você está logado como <strong>{user?.role || 'Usuário'}</strong>
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Settings className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Suas Informações
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user?.name || 'Nome não informado'}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        {user?.email}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* User Management Card (Admin Only) */}
            {isAdmin && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Gerenciamento
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Usuários do Sistema
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={navigateToUserManagement}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Gerenciar Usuários
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Access Level Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className={`h-6 w-6 ${isAdmin ? 'text-green-400' : 'text-yellow-400'}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Nível de Acesso
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user?.role || 'Usuário'}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        {isAdmin 
                          ? 'Acesso completo ao sistema' 
                          : 'Acesso limitado - usuário padrão'
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Informações do Sistema
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Todos os usuários registrados têm acesso a esta página inicial</p>
                <p>• Apenas administradores podem acessar o gerenciamento de usuários</p>
                <p>• Suas informações de perfil são exibidas no cabeçalho</p>
                {!isAdmin && (
                  <p className="text-yellow-600">
                    • Para acessar funcionalidades administrativas, entre em contato com um administrador
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}