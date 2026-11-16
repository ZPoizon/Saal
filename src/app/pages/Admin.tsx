import { useState } from "react"

import {
  Lock,
  PawPrint,
  Mail,
  Trash2,
  Edit,
  Plus,
  Heart,
  CheckCircle,
  X,
  UserCheck,
  UserX,
  Clock,
  ArrowLeft,
} from "lucide-react"

import { Link } from "react-router"

import { Animal } from "../data/animals"

import logoSaal from "../../imports/logo_fundo_0.png"

import { AnimalForm } from "../components/admin/AnimalForm"

import { useInterest } from "../contexts/InterestContext"

import { useAnimals } from "../contexts/AnimalContext"

import { getAnimalImageUrl } from "../data/animalImages"

export function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [credentials, setCredentials] = useState({ username: "", password: "" })

  const [showForm, setShowForm] = useState(false)

  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { interests, updateInterestStatus } = useInterest()

  const { animals, saveAnimals, storageError } = useAnimals()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      credentials.username === "admin" &&
      credentials.password === "saal2026"
    ) {
      setIsLoggedIn(true)
    } else {
      alert("Credenciais inválidas!")
    }
  }

  const handleAddAnimal = () => {
    setEditingAnimal(null)

    setShowForm(true)
  }

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal)

    setShowForm(true)
  }

  const handleSaveAnimal = (animalData: Partial<Animal>): boolean => {
    let updatedAnimals: Animal[]

    if (editingAnimal) {
      updatedAnimals = animals.map((a) =>
        a.id === editingAnimal.id ? { ...a, ...animalData } : a,
      )
    } else {
      const newAnimal: Animal = {
        id: String(Date.now()),

        name: animalData.name!,

        species: animalData.species!,

        age: animalData.age!,

        size: animalData.size!,

        sex: animalData.sex!,

        status: animalData.status!,

        description: animalData.description!,

        personality: animalData.personality || [],

        medicalInfo: animalData.medicalInfo || "",

        images: animalData.images || [],
      }

      updatedAnimals = [newAnimal, ...animals]
    }

    if (!saveAnimals(updatedAnimals)) return false

    setShowForm(false)

    setEditingAnimal(null)

    return true
  }

  const handleDeleteAnimal = (id: string) => {
    if (saveAnimals(animals.filter((a) => a.id !== id))) {
      setDeleteConfirm(null)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#2E7D6B] hover:text-[#E4B04A] mb-6 transition-colors font-semibold"
          >
            <ArrowLeft size={20} />
            Voltar ao Início
          </Link>
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="text-center mb-8">
              <img
                src={logoSaal}
                alt="SAAL"
                className="w-20 h-20 mx-auto mb-4 object-contain"
              />
              <h1 className="text-3xl font-bold text-[#2E7D6B] mb-2">
                Área Administrativa
              </h1>
              <p className="text-[#6FAE9C]">
                SAAL - Santuário de Animais Anjos da Luz
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-[#2E7D6B] mb-2">
                  Usuário
                </label>
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="admin"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[#2E7D6B] mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2E7D6B] text-white py-3 rounded-full font-semibold hover:bg-[#6FAE9C] transition-all shadow-md hover:shadow-lg"
              >
                Entrar
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Demo: usuário:{" "}
                <code className="bg-gray-100 px-1 rounded">admin</code> / senha:{" "}
                <code className="bg-gray-100 px-1 rounded">saal2026</code>
              </p>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D6B] mb-2">
              Painel Administrativo
            </h1>
            <p className="text-[#6FAE9C]">Gerencie os animais e interessados</p>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Sair
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6FAE9C]">Total de Animais</span>
              <PawPrint className="text-[#E4B04A]" size={20} />
            </div>
            <p className="text-3xl font-bold text-[#2E7D6B]">
              {animals.length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6FAE9C]">Disponíveis</span>
              <Heart className="text-[#2E7D6B]" size={20} />
            </div>
            <p className="text-3xl font-bold text-[#2E7D6B]">
              {animals.filter((a) => a.status === "available").length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6FAE9C]">Em Tratamento</span>
              <Heart className="text-[#E4B04A]" size={20} />
            </div>
            <p className="text-3xl font-bold text-[#2E7D6B]">
              {animals.filter((a) => a.status === "treatment").length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6FAE9C]">Adotados</span>
              <Heart className="text-green-500" size={20} fill="currentColor" />
            </div>
            <p className="text-3xl font-bold text-[#2E7D6B]">
              {animals.filter((a) => a.status === "adopted").length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6FAE9C]">Solicitações</span>
              <Mail className="text-[#E4B04A]" size={20} />
            </div>
            <p className="text-3xl font-bold text-[#2E7D6B]">
              {interests.filter((i) => i.status === "pending").length}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <p className="mb-4 text-sm text-[#527f74]">
            Este protótipo salva as alterações somente neste navegador. Elas não
            são enviadas para um servidor nem compartilhadas com outros
            dispositivos.
          </p>
          {storageError && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
            >
              {storageError}
            </p>
          )}
          <button
            onClick={handleAddAnimal}
            className="bg-[#E4B04A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d4a03a] transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Cadastrar Novo Animal
          </button>
        </div>

        {/* Animals Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-[#F5EFE6]">
            <h2 className="text-xl font-bold text-[#2E7D6B]">
              Animais Cadastrados
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5EFE6]">
                <tr>
                  <th className="px-6 py-3 text-left text-[#2E7D6B]">Foto</th>
                  <th className="px-6 py-3 text-left text-[#2E7D6B]">Nome</th>
                  <th className="px-6 py-3 text-left text-[#2E7D6B]">
                    Espécie
                  </th>
                  <th className="px-6 py-3 text-left text-[#2E7D6B]">Idade</th>
                  <th className="px-6 py-3 text-left text-[#2E7D6B]">Status</th>
                  <th className="px-6 py-3 text-left text-[#2E7D6B]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EFE6]">
                {animals.map((animal) => (
                  <tr
                    key={animal.id}
                    className="hover:bg-[#F5EFE6]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={
                          animal.images[0]
                            ? getAnimalImageUrl(
                                animal.images[0],
                                "w=60&h=60&fit=crop",
                              )
                            : "https://via.placeholder.com/60"
                        }
                        alt={animal.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#2E7D6B]">
                      {animal.name}
                    </td>
                    <td className="px-6 py-4 text-[#6FAE9C]">
                      {animal.species === "dog" ? "Cachorro" : "Gato"}
                    </td>
                    <td className="px-6 py-4 text-[#6FAE9C]">{animal.age}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          animal.status === "available"
                            ? "bg-[#2E7D6B] text-white"
                            : animal.status === "treatment"
                              ? "bg-[#E4B04A] text-white"
                              : "bg-gray-400 text-white"
                        }`}
                      >
                        {animal.status === "available"
                          ? "Disponível"
                          : animal.status === "treatment"
                            ? "Tratamento"
                            : "Adotado"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAnimal(animal)}
                          className="p-2 text-[#2E7D6B] hover:bg-[#F5EFE6] rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        {deleteConfirm === animal.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDeleteAnimal(animal.id)}
                              className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                              title="Confirmar exclusão"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                              title="Cancelar"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(animal.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interests Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mt-8">
          <div className="p-6 border-b border-[#F5EFE6]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#2E7D6B] flex items-center gap-2">
                <Mail size={20} className="text-[#E4B04A]" />
                Solicitações de Adoção
              </h2>
              <span className="bg-[#E4B04A] text-white px-3 py-1 rounded-full text-sm font-semibold">
                {interests.filter((i) => i.status === "pending").length}{" "}
                pendentes
              </span>
            </div>
          </div>
          <div className="p-6">
            {interests.length === 0 ? (
              <p className="text-[#6FAE9C] text-center py-8">
                Nenhuma solicitação de adoção registrada no momento.
              </p>
            ) : (
              <div className="space-y-4">
                {interests.map((interest) => (
                  <div
                    key={interest.id}
                    className={`border rounded-xl p-4 transition-all ${
                      interest.status === "pending"
                        ? "border-[#E4B04A] bg-[#E4B04A]/5"
                        : interest.status === "accepted"
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Animal Info */}
                      <div className="flex items-center gap-3 md:w-1/3">
                        <img
                          src={getAnimalImageUrl(
                            interest.animalImage,
                            "w=60&h=60&fit=crop",
                          )}
                          alt={interest.animalName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-[#2E7D6B]">
                            {interest.animalName}
                          </p>
                          <p className="text-xs text-[#6FAE9C]">
                            {new Date(interest.date).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",

                                month: "2-digit",

                                year: "numeric",

                                hour: "2-digit",

                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Person Info */}
                      <div className="flex-1 md:w-1/3">
                        <p className="font-semibold text-[#2E7D6B]">
                          {interest.name}
                        </p>
                        <p className="text-sm text-[#6FAE9C]">
                          {interest.email}
                        </p>
                        <p className="text-sm text-[#6FAE9C]">
                          {interest.phone}
                        </p>
                        {interest.message && (
                          <p className="text-sm text-gray-600 mt-2 italic line-clamp-2">
                            "{interest.message}"
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 md:w-1/3 md:justify-center">
                        {interest.status === "pending" ? (
                          <>
                            <button
                              onClick={() =>
                                updateInterestStatus(interest.id, "accepted")
                              }
                              className="flex-1 md:flex-none bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-semibold"
                            >
                              <UserCheck size={18} />
                              Aceitar
                            </button>
                            <button
                              onClick={() =>
                                updateInterestStatus(interest.id, "rejected")
                              }
                              className="flex-1 md:flex-none bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-semibold"
                            >
                              <UserX size={18} />
                              Recusar
                            </button>
                          </>
                        ) : (
                          <div
                            className={`px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                              interest.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {interest.status === "accepted" ? (
                              <>
                                <CheckCircle size={18} />
                                Aceito
                              </>
                            ) : (
                              <>
                                <X size={18} />
                                Recusado
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <AnimalForm
          animal={editingAnimal || undefined}
          onSave={handleSaveAnimal}
          onCancel={() => {
            setShowForm(false)

            setEditingAnimal(null)
          }}
        />
      )}
    </div>
  )
}
