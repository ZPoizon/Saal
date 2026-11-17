import { useEffect, useRef, useState } from "react"

import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Upload,
  X,
} from "lucide-react"

import { Animal, AnimalInput, AnimalStatus } from "../../data/animals"

import { AnimalApiError } from "../../services/animals-api"

import { PhotoUploadError } from "../../services/photo-storage"

import {
  getPhotoUploadErrorMessage,
  isPhotoStorageConfigured,
  uploadAnimalPhotos,
} from "../../services/supabase-photos"

import {
  MAX_ANIMAL_PHOTOS,
  MAX_PHOTO_BYTES,
  formatFileSize,
  moveListItem,
  selectPhotoFiles,
} from "../../utils/photo-selection"

import { SafeImage } from "../SafeImage"

interface AnimalFormProps {
  animal?: Animal

  onSave: (input: AnimalInput) => Promise<void>

  onCancel: () => void
}

interface ExistingPhoto {
  kind: "existing"

  id: string

  url: string
}

interface PendingPhoto {
  kind: "pending"

  id: string

  file: File

  previewUrl: string
}

type GalleryPhoto = ExistingPhoto | PendingPhoto

function isPendingPhoto(photo: GalleryPhoto): photo is PendingPhoto {
  return photo.kind === "pending"
}

function saveErrorMessage(error: unknown): string {
  if (error instanceof AnimalApiError) {
    if (error.status === 401 || error.status === 403) {
      return "Sua sessão expirou durante o salvamento. Entre novamente; o cadastro não foi confirmado como salvo."
    }

    if (error.status === 404) {
      return "O serviço de animais não foi encontrado. A API pode não estar publicada ou o proxy /api não está configurado."
    }

    if (error.status >= 500) {
      return "O servidor está temporariamente indisponível. O cadastro não foi confirmado como salvo; tente novamente."
    }

    if (error.status === 429) {
      return "Muitas solicitações em pouco tempo. Aguarde e tente novamente."
    }
  }

  return "Não foi possível salvar o animal. Verifique a conexão e tente novamente."
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

  const nextPhotoId = useRef(0)

  const [gallery, setGallery] = useState<GalleryPhoto[]>(() =>
    (animal?.images ?? [])

      .filter((url) => url.trim().length > 0)

      .map((url, index) => ({
        kind: "existing" as const,

        id: `existing-${index}`,

        url,
      })),
  )

  const [photoErrors, setPhotoErrors] = useState<string[]>([])

  const [submitError, setSubmitError] = useState("")

  const [submitting, setSubmitting] = useState(false)

  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const replaceTargetRef = useRef<string | null>(null)

  const galleryRef = useRef(gallery)

  useEffect(() => {
    galleryRef.current = gallery
  }, [gallery])

  // Pré-visualizações são recursos do navegador e precisam ser liberadas.

  useEffect(() => {
    return () => {
      galleryRef.current.forEach((photo) => {
        if (isPendingPhoto(photo)) URL.revokeObjectURL(photo.previewUrl)
      })
    }
  }, [])

  const storageConfigured = isPhotoStorageConfigured()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    })
  }

  const openFilePicker = (targetId: string | null) => {
    replaceTargetRef.current = targetId

    fileInputRef.current?.click()
  }

  const appendPending = (files: readonly File[]) => {
    if (files.length === 0) return

    setGallery((current) => [
      ...current,

      ...files.map((file) => ({
        kind: "pending" as const,

        id: `new-${nextPhotoId.current++}`,

        file,

        previewUrl: URL.createObjectURL(file),
      })),
    ])
  }

  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(e.target.files ?? [])

    e.target.value = ""

    if (chosen.length === 0) {
      replaceTargetRef.current = null

      return
    }

    const replaceTarget = replaceTargetRef.current

    replaceTargetRef.current = null

    // Substituição usa somente o primeiro arquivo e preserva a posição.

    if (replaceTarget) {
      const result = selectPhotoFiles(chosen.slice(0, 1), 0)

      setPhotoErrors(result.errors)

      const replacement = result.accepted[0]

      if (!replacement) return

      const previewUrl = URL.createObjectURL(replacement)

      setGallery((current) =>
        current.map((photo) => {
          if (photo.id !== replaceTarget) return photo

          if (isPendingPhoto(photo)) URL.revokeObjectURL(photo.previewUrl)

          return { ...photo, kind: "pending", file: replacement, previewUrl }
        }),
      )

      return
    }

    const result = selectPhotoFiles(chosen, galleryRef.current.length)

    setPhotoErrors(result.errors)

    appendPending(result.accepted)
  }

  const handleRemovePhoto = (id: string) => {
    setGallery((current) => {
      const target = current.find((photo) => photo.id === id)

      if (target && isPendingPhoto(target)) {
        URL.revokeObjectURL(target.previewUrl)
      }

      return current.filter((photo) => photo.id !== id)
    })

    setPhotoErrors([])
  }

  const handleMovePhoto = (from: number, to: number) => {
    setGallery((current) => moveListItem(current, from, to))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (submitting) return

    setSubmitError("")

    if (gallery.length < 1 || gallery.length > MAX_ANIMAL_PHOTOS) {
      setPhotoErrors([
        `Adicione de 1 a ${MAX_ANIMAL_PHOTOS} fotos antes de salvar.`,
      ])

      return
    }

    const pending = gallery.filter(isPendingPhoto)

    if (pending.length > 0 && !storageConfigured) {
      setPhotoErrors([
        getPhotoUploadErrorMessage(new PhotoUploadError("not-configured")),
      ])

      return
    }

    setPhotoErrors([])

    setSubmitting(true)

    let finalGallery: ExistingPhoto[] = gallery.filter(
      (photo): photo is ExistingPhoto => photo.kind === "existing",
    )

    if (pending.length > 0) {
      setUploadProgress(0)

      try {
        const urls = await uploadAnimalPhotos(
          pending.map((photo) => photo.file),

          { onProgress: setUploadProgress },
        )

        let urlIndex = 0

        finalGallery = gallery.map((photo) => {
          if (photo.kind === "existing") return photo

          const url = urls[urlIndex++]

          return {
            kind: "existing" as const,

            id: photo.id,

            url: url ?? "",
          }
        })

        pending.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))

        setGallery(finalGallery)
      } catch (error) {
        setPhotoErrors([getPhotoUploadErrorMessage(error)])

        setUploadProgress(null)

        setSubmitting(false)

        return
      }
    }

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

        images: finalGallery.map((photo) => photo.url),
      })
    } catch (error) {
      setSubmitError(saveErrorMessage(error))
    } finally {
      setSubmitting(false)

      setUploadProgress(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="animal-form-title"
        className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white sm:max-h-[calc(100dvh-2rem)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#F5EFE6] p-4 sm:p-6">
          <h2 className="text-xl font-bold text-[#2E7D6B] sm:text-2xl">
            <span id="animal-form-title">
              {animal ? "Editar Animal" : "Adicionar Novo Animal"}
            </span>
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar formulário"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors hover:bg-[#F5EFE6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A]"
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
              Fotos do animal ({gallery.length}/{MAX_ANIMAL_PHOTOS})
            </legend>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {gallery.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative overflow-hidden rounded-xl border border-[#E4B04A]/40 bg-[#F5EFE6]"
                >
                  <div className="aspect-square w-full overflow-hidden bg-[#F5EFE6]">
                    {photo.kind === "existing" ? (
                      <SafeImage
                        src={photo.url}
                        alt={`Foto ${index + 1} de ${animal?.name ?? "animal"}`}
                        params={{ w: 300, h: 300, fit: "crop" }}
                        className="h-full w-full object-cover [image-orientation:from-image]"
                      />
                    ) : (
                      <img
                        src={photo.previewUrl}
                        alt={`Prévia local da foto ${index + 1}`}
                        className="h-full w-full object-cover [image-orientation:from-image]"
                      />
                    )}
                  </div>

                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-[#2E7D6B] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Capa
                    </span>
                  )}

                  {photo.kind === "pending" && (
                    <span className="absolute right-2 top-2 rounded-full bg-[#E4B04A] px-2 py-0.5 text-[10px] font-semibold text-white">
                      Prévia local
                    </span>
                  )}

                  <div className="flex items-center justify-between gap-1 border-t border-white/70 bg-white/95 p-1">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleMovePhoto(index, index - 1)}
                        disabled={submitting || index === 0}
                        aria-label={`Mover foto ${index + 1} para a esquerda`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#2E7D6B] hover:bg-[#F5EFE6] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePhoto(index, index + 1)}
                        disabled={submitting || index === gallery.length - 1}
                        aria-label={`Mover foto ${index + 1} para a direita`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#2E7D6B] hover:bg-[#F5EFE6] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openFilePicker(photo.id)}
                        disabled={submitting}
                        aria-label={`Substituir foto ${index + 1}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#2E7D6B] hover:bg-[#F5EFE6] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <RefreshCw size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        disabled={submitting}
                        aria-label={`Remover foto ${index + 1}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {gallery.length < MAX_ANIMAL_PHOTOS && (
                <button
                  type="button"
                  onClick={() => openFilePicker(null)}
                  disabled={submitting}
                  className="flex min-h-[80px] max-h-[110px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#6FAE9C]/60 bg-white p-2 text-center text-[#2E7D6B] transition-colors hover:border-[#2E7D6B] hover:bg-[#F5EFE6]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={24} aria-hidden="true" />
                  <span className="text-sm font-semibold">Adicionar foto</span>
                  <span className="text-xs text-[#6FAE9C]">
                    {gallery.length}/{MAX_ANIMAL_PHOTOS}
                  </span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChosen}
              className="sr-only"
              tabIndex={-1}
              aria-label="Escolher fotos da galeria do dispositivo"
            />

            <p className="mt-2 text-xs text-[#416f65]">
              Escolha de 1 a {MAX_ANIMAL_PHOTOS} imagens da galeria do
              dispositivo. Cada foto pode ter até{" "}
              {formatFileSize(MAX_PHOTO_BYTES)}. A câmera não é aberta
              automaticamente. A primeira foto é a capa.
            </p>

            {!storageConfigured && (
              <p
                role="status"
                className="mt-2 flex items-start gap-2 rounded-lg bg-[#F5EFE6] px-3 py-2 text-xs text-[#416f65]"
              >
                <ImageIcon
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />
                <span>
                  O armazenamento de fotos não está configurado neste ambiente.
                  Você pode ver a prévia local, mas fotos escolhidas não serão
                  salvas até o serviço de armazenamento ser configurado.
                </span>
              </p>
            )}

            {uploadProgress !== null && (
              <div role="status" className="mt-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#2E7D6B]">
                  <span className="inline-flex items-center gap-1">
                    <Upload size={14} aria-hidden="true" />
                    Enviando fotos…
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#F5EFE6]">
                  <div
                    className="h-full rounded-full bg-[#2E7D6B] transition-[width]"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {photoErrors.length > 0 && (
              <ul
                role="alert"
                className="mt-2 space-y-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {photoErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}
          </fieldset>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="mb-2 block text-[#2E7D6B]">
                Nome *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              />
            </div>

            {/* Espécie */}
            <div>
              <label htmlFor="species" className="mb-2 block text-[#2E7D6B]">
                Espécie *
              </label>
              <select
                id="species"
                name="species"
                required
                value={formData.species}
                onChange={handleChange}
                className="w-full rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              >
                <option value="dog">Canino</option>
                <option value="cat">Felino</option>
              </select>
            </div>

            {/* Idade */}
            <div>
              <label htmlFor="age" className="mb-2 block text-[#2E7D6B]">
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
                className="w-full rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              />
            </div>

            {/* Porte */}
            <div>
              <label htmlFor="size" className="mb-2 block text-[#2E7D6B]">
                Porte *
              </label>
              <select
                id="size"
                name="size"
                required
                value={formData.size}
                onChange={handleChange}
                className="w-full rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              >
                <option value="pequeno">Pequeno</option>
                <option value="médio">Médio</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            {/* Sexo */}
            <div>
              <label htmlFor="sex" className="mb-2 block text-[#2E7D6B]">
                Sexo *
              </label>
              <select
                id="sex"
                name="sex"
                required
                value={formData.sex}
                onChange={handleChange}
                className="w-full rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              >
                <option value="macho">Macho</option>
                <option value="fêmea">Fêmea</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="mb-2 block text-[#2E7D6B]">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              >
                <option value="available">Disponível</option>
                <option value="adopted">Adotado</option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="mb-2 block text-[#2E7D6B]">
              Descrição *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
            />
          </div>

          {/* Personalidade */}
          <div>
            <label htmlFor="personality" className="mb-2 block text-[#2E7D6B]">
              Personalidade (separado por vírgula)
            </label>
            <input
              type="text"
              id="personality"
              name="personality"
              placeholder="Ex: Dócil, Brincalhão, Carinhoso"
              value={formData.personality}
              onChange={handleChange}
              className="w-full rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
            />
          </div>

          {/* Informações Médicas */}
          <div>
            <label htmlFor="medicalInfo" className="mb-2 block text-[#2E7D6B]">
              Informações Médicas
            </label>
            <textarea
              id="medicalInfo"
              name="medicalInfo"
              rows={2}
              placeholder="Ex: Vacinado, castrado, saudável"
              value={formData.medicalInfo}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
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
          <div className="flex flex-col-reverse gap-3 pt-4 pb-6 px-4 sm:flex-row sm:px-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="min-h-11 flex-1 rounded-full bg-gray-200 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-11 flex-1 rounded-full bg-[#E4B04A] py-3 font-semibold text-white transition-colors hover:bg-[#d4a03a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? uploadProgress !== null
                  ? `Enviando fotos… ${uploadProgress}%`
                  : "Salvando…"
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
