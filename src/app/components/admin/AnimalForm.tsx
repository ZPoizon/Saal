import { useState } from "react"

import { X, Plus, Image as ImageIcon } from "lucide-react"

import { Animal, AnimalInput, AnimalStatus } from "../../data/animals"

import { withImageParams } from "../../utils/images"

interface AnimalFormProps {
  animal?: Animal

  onSave: (input: AnimalInput) => Promise<void>

  onCancel: () => void
}

export function AnimalForm({ animal, onSave, onCancel }: AnimalFormProps) {
  const [formData, setFormData] = useState({
    name: animal?.name || "",

    species: animal?.species || "dog",

    age: animal?.age || "",

    size: animal?.size || "médio",

    sex: animal?.sex || "macho",

    status: animal?.status || "available",

    description: animal?.description || "",

    personality: animal?.personality?.join(", ") || "",

    medicalInfo: animal?.medicalInfo || "",
  })

  const [photoUrls, setPhotoUrls] = useState<string[]>(
    animal?.images && animal.images.length > 0 ? [...animal.images] : [""],
  )

  const [photoError, setPhotoError] = useState("")

  const [submitError, setSubmitError] = useState("")

  const [submitting, setSubmitting] = useState(false)

  const validPhotos = photoUrls

    .map((url) => url.trim())

    .filter((url) => url.length > 0)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    })
  }

  const handlePhotoChange = (index: number, value: string) => {
    setPhotoUrls((current) =>
      current.map((url, position) => (position === index ? value : url)),
    )

    setPhotoError("")
  }

  const handleAddPhoto = () => {
    setPhotoUrls((current) =>
      current.length >= 3 ? current : [...current, ""],
    )
  }

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls((current) => {
      const next = current.filter((_, position) => position !== index)

      return next.length > 0 ? next : [""]
    })

    setPhotoError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validPhotos.length < 1 || validPhotos.length > 3) {
      setPhotoError("Informe entre 1 e 3 fotos (URLs) para o animal.")

      return
    }

    setPhotoError("")

    setSubmitError("")

    setSubmitting(true)

    try {
      await onSave({
        name: formData.name.trim(),

        species: formData.species as "dog" | "cat",

        age: formData.age.trim(),

        size: formData.size as "pequeno" | "médio" | "grande",

        sex: formData.sex as "macho" | "fêmea",

        status: formData.status as AnimalStatus,

        description: formData.description.trim(),

        personality: formData.personality

          .split(",")

          .map((trait) => trait.trim())

          .filter((trait) => trait.length > 0),

        medicalInfo: formData.medicalInfo.trim(),

        images: validPhotos,
      })
    } catch {
      setSubmitError(
        "Não foi possível salvar o animal. Verifique a conexão e tente novamente.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="animal-form-title"
        className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#F5EFE6] p-4 sm:p-6">
          <h2 className="text-2xl font-bold text-[#2E7D6B]">
            <span id="animal-form-title">
              {animal ? "Editar Animal" : "Adicionar Novo Animal"}
            </span>
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar formulário"
            className="p-2 hover:bg-[#F5EFE6] rounded-lg transition-colors"
          >
            <X className="text-[#6FAE9C]" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6"
        >
          <fieldset>
            <legend className="mb-2 font-semibold text-[#2E7D6B]">
              Fotos do animal ({validPhotos.length}/3)
            </legend>
            <div className="space-y-3">
              {photoUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F5EFE6]">
                    {url.trim() ? (
                      <img
                        src={withImageParams(url.trim(), {
                          w: 300,

                          h: 300,

                          fit: "crop",
                        })}
                        alt={`Prévia da foto ${index + 1} de ${
                          animal?.name ?? "prévia do animal"
                        }`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#6FAE9C]">
                        <ImageIcon size={24} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    inputMode="url"
                    value={url}
                    onChange={(e) => handlePhotoChange(index, e.target.value)}
                    placeholder="https://exemplo.com/foto.jpg"
                    aria-label={`URL da foto ${index + 1}`}
                    className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  />
                  <button
                    type="button"
                    aria-label={`Remover foto ${index + 1}`}
                    onClick={() => handleRemovePhoto(index)}
                    className="shrink-0 rounded-full bg-white p-2 text-red-600 shadow hover:bg-[#F5EFE6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A]"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAddPhoto}
                disabled={photoUrls.length >= 3}
                className="inline-flex items-center gap-2 rounded-lg bg-[#6FAE9C] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#2E7D6B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E4B04A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={20} />
                Adicionar foto
              </button>
              <span className="text-xs text-[#6FAE9C]">
                Informe de 1 a 3 endereços (URLs) de fotos já publicadas.
              </span>
            </div>
            <p role="status" className="mt-2 text-xs text-[#416f65]">
              O upload de arquivos ainda não está disponível. As fotos são
              referências (URLs): nenhum arquivo é enviado, e o armazenamento
              definitivo das imagens segue pendente de decisão da ONG.
            </p>
            {photoError && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {photoError}
              </p>
            )}
          </fieldset>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-[#2E7D6B] mb-2">
                Nome *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              />
            </div>

            {/* Espécie */}
            <div>
              <label htmlFor="species" className="block text-[#2E7D6B] mb-2">
                Espécie *
              </label>
              <select
                id="species"
                name="species"
                required
                value={formData.species}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              >
                <option value="dog">Cachorro</option>
                <option value="cat">Gato</option>
              </select>
            </div>

            {/* Idade */}
            <div>
              <label htmlFor="age" className="block text-[#2E7D6B] mb-2">
                Idade *
              </label>
              <input
                type="text"
                id="age"
                name="age"
                required
                placeholder="Ex: 3 anos, 6 meses"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              />
            </div>

            {/* Porte */}
            <div>
              <label htmlFor="size" className="block text-[#2E7D6B] mb-2">
                Porte *
              </label>
              <select
                id="size"
                name="size"
                required
                value={formData.size}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              >
                <option value="pequeno">Pequeno</option>
                <option value="médio">Médio</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            {/* Sexo */}
            <div>
              <label htmlFor="sex" className="block text-[#2E7D6B] mb-2">
                Sexo *
              </label>
              <select
                id="sex"
                name="sex"
                required
                value={formData.sex}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              >
                <option value="macho">Macho</option>
                <option value="fêmea">Fêmea</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-[#2E7D6B] mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              >
                <option value="available">Disponível</option>
                <option value="adopted">Adotado</option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-[#2E7D6B] mb-2">
              Descrição *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A] resize-none"
            />
          </div>

          {/* Personalidade */}
          <div>
            <label htmlFor="personality" className="block text-[#2E7D6B] mb-2">
              Personalidade (separado por vírgula)
            </label>
            <input
              type="text"
              id="personality"
              name="personality"
              placeholder="Ex: Dócil, Brincalhão, Carinhoso"
              value={formData.personality}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
            />
          </div>

          {/* Informações Médicas */}
          <div>
            <label htmlFor="medicalInfo" className="block text-[#2E7D6B] mb-2">
              Informações Médicas
            </label>
            <textarea
              id="medicalInfo"
              name="medicalInfo"
              rows={2}
              placeholder="Ex: Vacinado, castrado, saudável"
              value={formData.medicalInfo}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A] resize-none"
            />
          </div>

          {submitError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {submitError}
            </p>
          )}

          {/* Botões */}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#E4B04A] text-white py-3 rounded-full font-semibold hover:bg-[#d4a03a] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Salvando…"
                : animal
                  ? "Salvar Alterações"
                  : "Adicionar Animal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
