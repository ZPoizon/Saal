import { useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Animal, AnimalStatus } from "../../data/animals";

interface AnimalFormProps {
  animal?: Animal;
  onSave: (animal: Partial<Animal>) => void;
  onCancel: () => void;
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
  });

  const [imagePreview, setImagePreview] = useState<string>(animal?.images?.[0] || "");
  const [imageUrl, setImageUrl] = useState<string>(animal?.images?.[0] || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreview(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const animalData: Partial<Animal> = {
      ...formData,
      personality: formData.personality.split(",").map(p => p.trim()).filter(p => p),
      images: imageUrl ? [imageUrl] : [],
      species: formData.species as "dog" | "cat",
      size: formData.size as "pequeno" | "médio" | "grande",
      sex: formData.sex as "macho" | "fêmea",
      status: formData.status as AnimalStatus,
    };

    if (animal) {
      animalData.id = animal.id;
    }

    onSave(animalData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8">
        <div className="p-6 border-b border-[#F5EFE6] flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2E7D6B]">
            {animal ? "Editar Animal" : "Adicionar Novo Animal"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-[#F5EFE6] rounded-lg transition-colors"
          >
            <X className="text-[#6FAE9C]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Upload de Foto */}
          <div>
            <label className="block text-[#2E7D6B] mb-2">Foto do Animal</label>
            <div className="space-y-3">
              {imagePreview && (
                <div className="relative w-full h-48 bg-[#F5EFE6] rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="URL da imagem (ex: https://...)"
                    className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  />
                </div>
                <label className="bg-[#6FAE9C] text-white px-4 py-3 rounded-lg cursor-pointer hover:bg-[#2E7D6B] transition-colors flex items-center gap-2">
                  <Upload size={20} />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-[#6FAE9C]">
                Cole uma URL de imagem ou faça upload de um arquivo
              </p>
            </div>
          </div>

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
                <option value="treatment">Em Tratamento</option>
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
          <div className="flex gap-3 pt-4">
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
  );
}
