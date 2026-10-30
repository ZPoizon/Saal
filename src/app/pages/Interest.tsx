import { useParams, Link, useNavigate } from "react-router"

import { ArrowLeft, Heart } from "lucide-react"

import { getAnimalById } from "../data/animals"

import { useState } from "react"

export function Interest() {
  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const animal = id ? getAnimalById(id) : undefined

  const [formData, setFormData] = useState({
    name: "",

    email: "",

    whatsapp: "",

    city: "",
  })

  if (!animal) {
    return (
      <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2E7D6B] mb-4">
            Animal não encontrado
          </h2>
          <Link to="/animais" className="text-[#E4B04A] hover:underline">
            Voltar para lista de animais
          </Link>
        </div>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#2E7D6B] hover:text-[#E4B04A] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Heart
              className="w-16 h-16 text-[#E4B04A] mx-auto mb-4"
              fill="#E4B04A"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-[#2E7D6B] mb-3">
              Manifestar Interesse
            </h1>
            <p className="text-[#6FAE9C]">
              Preencha o formulário abaixo para demonstrar interesse em adotar{" "}
              <strong>{animal.name}</strong>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg mb-6">
            <div className="flex items-center gap-4 pb-6 border-b border-[#F5EFE6]">
              <img
                src={`${animal.images[0]}?w=100&h=100&fit=crop`}
                alt={animal.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-bold text-[#2E7D6B] text-lg">
                  {animal.name}
                </h3>
                <p className="text-sm text-[#6FAE9C]">
                  {animal.species === "dog" ? "Cachorro" : "Gato"} •{" "}
                  {animal.age} • {animal.sex}
                </p>
              </div>
            </div>

            <form
              onSubmit={(event) => event.preventDefault()}
              className="mt-6 space-y-4"
              aria-describedby="interest-form-status"
            >
              <div>
                <label htmlFor="name" className="block text-[#2E7D6B] mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-[#2E7D6B] mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-[#2E7D6B] mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="Sua cidade"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[#2E7D6B] mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="seu.email@exemplo.com"
                />
              </div>

              <p
                id="interest-form-status"
                role="status"
                className="rounded-lg border border-[#E4B04A]/50 bg-[#F5EFE6] p-3 text-sm text-[#416f65]"
              >
                O envio ainda não está conectado ao backend. Os dados digitados
                ficam somente nesta tela e não são enviados nem persistidos pelo
                SAAL.
              </p>
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-full bg-[#E4B04A] py-4 font-semibold text-white opacity-60 shadow-md"
              >
                Envio indisponível nesta versão
              </button>
            </form>
          </div>

          <div className="bg-[#2E7D6B]/10 border border-[#2E7D6B] rounded-xl p-4 text-sm text-[#2E7D6B]">
            <p>
              <strong>Importante:</strong> A manifestação não aprova a adoção. A
              avaliação é manual; o envio será habilitado quando o backend
              estiver integrado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
