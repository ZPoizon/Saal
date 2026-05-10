import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Heart, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { getAnimalById } from "../data/animals";
import { useState } from "react";

export function Interest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const animal = id ? getAnimalById(id) : undefined;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-8 md:p-12 shadow-xl max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-[#2E7D6B] rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#2E7D6B] mb-4">
            Interesse Registrado!
          </h2>
          <p className="text-gray-600 mb-8">
            Recebemos seu interesse em adotar <strong>{animal.name}</strong>.
            Entraremos em contato em breve para dar continuidade ao processo de adoção.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/animais"
              className="bg-[#2E7D6B] text-white py-3 px-6 rounded-full font-semibold hover:bg-[#6FAE9C] transition-colors"
            >
              Ver Outros Animais
            </Link>
            <Link
              to="/"
              className="text-[#6FAE9C] hover:text-[#2E7D6B] transition-colors"
            >
              Voltar ao Início
            </Link>
          </div>
        </motion.div>
      </div>
    );
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
            <Heart className="w-16 h-16 text-[#E4B04A] mx-auto mb-4" fill="#E4B04A" />
            <h1 className="text-3xl md:text-4xl font-bold text-[#2E7D6B] mb-3">
              Manifestar Interesse
            </h1>
            <p className="text-[#6FAE9C]">
              Preencha o formulário abaixo para demonstrar interesse em adotar <strong>{animal.name}</strong>
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
                <h3 className="font-bold text-[#2E7D6B] text-lg">{animal.name}</h3>
                <p className="text-sm text-[#6FAE9C]">
                  {animal.species === "dog" ? "Cachorro" : "Gato"} • {animal.age} • {animal.sex}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-[#2E7D6B] mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[#2E7D6B] mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="seu.email@exemplo.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-[#2E7D6B] mb-2">
                  WhatsApp/Telefone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[#2E7D6B] mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A] resize-none"
                  placeholder="Conte-nos um pouco sobre você e por que deseja adotar..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E4B04A] text-white py-4 rounded-full font-semibold hover:bg-[#d4a03a] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar Interesse"}
              </button>
            </form>
          </div>

          <div className="bg-[#2E7D6B]/10 border border-[#2E7D6B] rounded-xl p-4 text-sm text-[#2E7D6B]">
            <p>
              <strong>Importante:</strong> Após o envio, nossa equipe entrará em contato para
              agendar uma entrevista e visita. O processo de adoção é cuidadoso para garantir
              o bem-estar do animal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
