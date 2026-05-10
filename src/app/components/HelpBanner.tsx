import { Heart, DollarSign, Share2 } from "lucide-react";
import { motion } from "motion/react";

export function HelpBanner() {
  return (
    <section className="py-12 bg-gradient-to-r from-[#E4B04A] to-[#d4a03a] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Como Você Pode Ajudar
          </h2>
          <p className="text-sm md:text-base opacity-90">
            Além de adotar, existem outras formas de apoiar nosso trabalho
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
          >
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-7 h-7" />
            </div>
            <h3 className="font-semibold mb-2">Faça uma Doação</h3>
            <p className="text-sm opacity-90">
              Ajude com ração, medicamentos e tratamentos veterinários
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
          >
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7" fill="white" />
            </div>
            <h3 className="font-semibold mb-2">Seja Voluntário</h3>
            <p className="text-sm opacity-90">
              Doe seu tempo e carinho cuidando dos animais
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
          >
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-7 h-7" />
            </div>
            <h3 className="font-semibold mb-2">Divulgue</h3>
            <p className="text-sm opacity-90">
              Compartilhe nosso trabalho e ajude a encontrar lares
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
