import { useEffect, useRef, useState } from "react"

import { X, Upload, Image as ImageIcon } from "lucide-react"

import { Animal, AnimalStatus } from "../../data/animals"

interface AnimalFormProps {
  animal?: Animal

  onSave: (animal: Partial<Animal>) => void

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

  const [selectedImages, setSelectedImages] = useState<Array<{
    file: File
    url: string
  }>>([])

  const [removedImages, setRemovedImages] = useState<string[]>([])

  const [photoError, setPhotoError] = useState("")

  const previewUrls = useRef(new Set<string>())

  const previewsTransferred = useRef(false)

  const currentImages = (animal?.images ?? []).filter(
    (image) => !removedImages.includes(image),
  )

  useEffect(() => {
    return () => {
      if (!previewsTransferred.current) {
        previewUrls.current.forEach((url) => URL.revokeObjectURL(url))
      }
    }
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files ?? [])

    const availableSlots = Math.max(
      0,

      3 - currentImages.length - selectedImages.length,
    )

    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    const acceptedFiles = imageFiles.slice(0, availableSlots)

    if (imageFiles.length !== files.length) {
      setPhotoError("Selecione somente arquivos de imagem.")
    } else if (files.length > availableSlots) {
      setPhotoError("Cada animal pode ter no máximo 3 fotos.")
    } else {
      setPhotoError("")
    }

    const previews = acceptedFiles.map((file) => {
      const url = URL.createObjectURL(file)

      previewUrls.current.add(url)

      return { file, url }
    })

    setSelectedImages((current) => [...current, ...previews])

    e.currentTarget.value = ""
  }

  const handleRemoveSelectedImage = (url: string) => {
    URL.revokeObjectURL(url)

    previewUrls.current.delete(url)

    setSelectedImages((current) => current.filter((image) => image.url !== url))

    setPhotoError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const images = [
      ...currentImages,
      ...selectedImages.map((image) => image.url),
    ]

    if (images.length < 1 || images.length > 3) {
      setPhotoError("Selecione entre 1 e 3 fotos para o animal.")

      return
    }

    const animalData: Partial<Animal> = {
      ...formData,

      personality: formData.personality
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p),

      images,

      species: formData.species as "dog" | "cat",

      size: formData.size as "pequeno" | "médio" | "grande",

      sex: formData.sex as "macho" | "fêmea",

      status: formData.status as AnimalStatus,
    }

    if (animal) {
      animalData.id = animal.id
    }

    previewsTransferred.current = true

    onSave(animalData)
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
              Fotos do animal ({currentImages.length + selectedImages.length}/3)
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {currentImages.map((image, index) => (
                <div
                  key={image}
                  className="relative aspect-square overflow-hidden rounded-lg bg-[#F5EFE6]"
                >
                  <img
                    src={
                      image.startsWith("blob:")
                        ? image
                        : `${image}?w=300&h=300&fit=crop`
                    }
                    alt={`Foto ${index + 1} de ${animal?.name ?? "prévia do animal"}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remover foto ${index + 1}`}
                    onClick={() =>
                      setRemovedImages((current) => [...current, image])
                    }
                    className="absolute right-2 top-2 rounded-full bg-white/95 p-2 text-red-600 shadow hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A]"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {selectedImages.map((image, index) => (
                <div
                  key={image.url}
                  className="relative aspect-square overflow-hidden rounded-lg bg-[#F5EFE6]"
                >
                  <img
                    src={image.url}
                    alt={`Prévia local da foto ${currentImages.length + index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remover prévia de ${image.file.name}`}
                    onClick={() => handleRemoveSelectedImage(image.url)}
                    className="absolute right-2 top-2 rounded-full bg-white/95 p-2 text-red-600 shadow hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A]"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {currentImages.length + selectedImages.length === 0 && (
                <div className="col-span-full flex min-h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#6FAE9C]/50 bg-[#F5EFE6]/60 p-4 text-center text-[#6FAE9C]">
                  <ImageIcon size={28} aria-hidden="true" />
                  <span className="mt-2 text-sm">
                    Selecione de 1 a 3 fotos para visualizar
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#6FAE9C] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#2E7D6B] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#E4B04A]">
                <Upload size={20} />
                Escolher fotos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={currentImages.length + selectedImages.length >= 3}
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
              <span className="text-xs text-[#6FAE9C]">
                Selecione arquivos ou escolha imagens da galeria do celular.
              </span>
            </div>
            <p role="status" className="mt-2 text-xs text-[#416f65]">
              As prévias são locais. As fotos não são enviadas nem salvas no
              servidor nesta versão.
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

          {/* Botões */}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#E4B04A] text-white py-3 rounded-full font-semibold hover:bg-[#d4a03a] transition-colors"
            >
              {animal ? "Salvar Alterações" : "Adicionar Animal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
