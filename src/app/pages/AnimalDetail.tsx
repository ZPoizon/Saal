import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Heart, Calendar, Ruler, Info, Stethoscope, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { getAnimalById } from "../data/animals";
import { useState } from "react";

export function AnimalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const animal = id ? getAnimalById(id) : undefined;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!animal) {
    return (
      <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2E7D6B] mb-4">Animal não encontrado</h2>
          <Link to="/animais" className="text-[#E4B04A] hover:underline">
            Voltar para lista de animais
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    available: "bg-[#2E7D6B] text-white",
    treatment: "bg-[#E4B04A] text-white",
    adopted: "bg-gray-400 text-white"
  };

  const statusLabels = {
    available: "Disponível para Adoção",
    treatment: "Em Tratamento",
    adopted: "Adotado"
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#2E7D6B] hover:text-[#E4B04A] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-4">
              <div className="relative h-96 bg-[#F5EFE6]">
                <img
                  src={`${animal.images[currentImageIndex]}?w=800&h=800&fit=crop`}
                  alt={animal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`${statusColors[animal.status]} px-4 py-2 rounded-full text-sm font-semibold shadow-lg`}>
                    {statusLabels[animal.status]}
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {animal.images.length > 1 && (
              <div className="flex gap-2">
                {animal.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden ${
                      currentImageIndex === index ? "ring-4 ring-[#E4B04A]" : "opacity-60 hover:opacity-100"
                    } transition-all`}
                  >
                    <img
                      src={`${image}?w=200&h=200&fit=crop`}
                      alt={`${animal.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold text-[#2E7D6B] mb-4">{animal.name}</h1>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-2 text-[#6FAE9C] mb-1">
                  <Calendar size={16} />
                  <span className="text-sm">Idade</span>
                </div>
                <p className="font-semibold text-[#2E7D6B]">{animal.age}</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-2 text-[#6FAE9C] mb-1">
                  <Ruler size={16} />
                  <span className="text-sm">Porte</span>
                </div>
                <p className="font-semibold text-[#2E7D6B] capitalize">{animal.size}</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-2 text-[#6FAE9C] mb-1">
                  <Info size={16} />
                  <span className="text-sm">Sexo</span>
                </div>
                <p className="font-semibold text-[#2E7D6B] capitalize">{animal.sex}</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-2 text-[#6FAE9C] mb-1">
                  <Heart size={16} />
                  <span className="text-sm">Espécie</span>
                </div>
                <p className="font-semibold text-[#2E7D6B]">
                  {animal.species === "dog" ? "Cachorro" : "Gato"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <h3 className="font-semibold text-[#2E7D6B] mb-3 flex items-center gap-2">
                <Heart size={18} className="text-[#E4B04A]" />
                Sobre {animal.name}
              </h3>
              <p className="text-gray-700 leading-relaxed">{animal.description}</p>
            </div>

            {/* Personality */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <h3 className="font-semibold text-[#2E7D6B] mb-3">Personalidade</h3>
              <div className="flex flex-wrap gap-2">
                {animal.personality.map((trait, index) => (
                  <span
                    key={index}
                    className="bg-[#F5EFE6] text-[#2E7D6B] px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Medical Info */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <h3 className="font-semibold text-[#2E7D6B] mb-3 flex items-center gap-2">
                <Stethoscope size={18} className="text-[#E4B04A]" />
                Informações Médicas
              </h3>
              <p className="text-gray-700">{animal.medicalInfo}</p>
            </div>

            {/* Share Button */}
            <div className="bg-[#F5EFE6] rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 className="text-[#6FAE9C]" size={20} />
                <span className="text-sm text-[#2E7D6B]">Compartilhe {animal.name}</span>
              </div>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Conheça ${animal.name} - SAAL`,
                      text: `${animal.description}`,
                      url: window.location.href,
                    });
                  }
                }}
                className="text-[#E4B04A] hover:text-[#d4a03a] text-sm font-semibold"
              >
                Compartilhar
              </button>
            </div>

            {/* CTA Button */}
            {animal.status === "available" && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/interesse/${animal.id}`}
                  className="block w-full bg-[#E4B04A] text-white text-center py-4 rounded-full font-semibold hover:bg-[#d4a03a] transition-all shadow-lg hover:shadow-xl"
                >
                  Tenho Interesse em Adotar
                </Link>
              </motion.div>
            )}

            {animal.status === "treatment" && (
              <div className="bg-[#E4B04A]/10 border-2 border-[#E4B04A] text-[#2E7D6B] text-center py-4 rounded-xl">
                <p className="font-semibold">Este animal está em tratamento</p>
                <p className="text-sm mt-1">Em breve estará disponível para adoção</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
