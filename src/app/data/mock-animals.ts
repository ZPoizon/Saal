import type { Animal } from "./animals"

/**
 * Dados de exemplo do modo protótipo local.
 *
 * Este é um conteúdo demonstrativo recuperado do histórico do projeto: ele
 * alimenta o catálogo quando o frontend roda sem API. Nenhum desses animais
 * existe no banco de dados real, e as alterações feitas neles ficam salvas
 * somente no navegador.
 */
export const mockAnimals: Animal[] = [
  {
    id: "1",
    name: "Thor",
    species: "dog",
    age: "3 anos",
    size: "grande",
    sex: "macho",
    status: "available",
    description:
      "Thor é um canino dócil e carinhoso que adora brincar. Foi resgatado das ruas e está pronto para encontrar uma família amorosa.",
    personality: ["Dócil", "Brincalhão", "Protetor", "Sociável"],
    medicalInfo: "Vacinado, castrado e vermifugado. Saudável.",
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
    ],
  },
  {
    id: "2",
    name: "Luna",
    species: "cat",
    age: "2 anos",
    size: "pequeno",
    sex: "fêmea",
    status: "available",
    description:
      "Luna é uma felina carinhosa e tranquila. Adora carinho e é perfeita para apartamento.",
    personality: ["Carinhosa", "Tranquila", "Independente"],
    medicalInfo: "Vacinada, castrada e saudável.",
    images: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
    ],
  },
  {
    id: "3",
    name: "Mel",
    species: "dog",
    age: "5 anos",
    size: "médio",
    sex: "fêmea",
    status: "available",
    description:
      "Mel é uma canina meiga e calma, ideal para famílias com crianças. Muito companheira e leal.",
    personality: ["Meiga", "Calma", "Leal", "Ama crianças"],
    medicalInfo: "Vacinada, castrada. Em tratamento de pele (melhorando).",
    images: [
      "https://images.unsplash.com/photo-1558788353-f76d92427f16",
      "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8",
    ],
  },
  {
    id: "4",
    name: "Mingau",
    species: "cat",
    age: "1 ano",
    size: "pequeno",
    sex: "macho",
    status: "available",
    description:
      "Mingau está se recuperando de uma pata machucada. É super afetuoso e brincalhão.",
    personality: ["Afetuoso", "Brincalhão", "Curioso"],
    medicalInfo: "Em tratamento de pata. Previsão de alta em 2 semanas.",
    images: [
      "https://images.unsplash.com/photo-1573865526739-10c1de0fa4e8",
      "https://images.unsplash.com/photo-1615789591457-74a63395c990",
    ],
  },
  {
    id: "5",
    name: "Bob",
    species: "dog",
    age: "4 anos",
    size: "médio",
    sex: "macho",
    status: "available",
    description:
      "Bob é um canino alegre e energético. Perfeito para quem gosta de atividades ao ar livre.",
    personality: ["Energético", "Alegre", "Aventureiro"],
    medicalInfo: "Vacinado e castrado. Totalmente saudável.",
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d",
      "https://images.unsplash.com/photo-1561037404-61cd46aa615b",
    ],
  },
  {
    id: "6",
    name: "Belinha",
    species: "cat",
    age: "6 meses",
    size: "pequeno",
    sex: "fêmea",
    status: "available",
    description:
      "Belinha é uma filhotinha cheia de energia e amor para dar. Adora brincar e explorar.",
    personality: ["Brincalhona", "Curiosa", "Amorosa"],
    medicalInfo: "Primeira dose de vacina. Aguardando idade para castração.",
    images: [
      "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee",
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987",
    ],
  },
  {
    id: "7",
    name: "Rex",
    species: "dog",
    age: "7 anos",
    size: "grande",
    sex: "macho",
    status: "adopted",
    description:
      "Rex encontrou seu lar para sempre! Era um canino muito leal e protetor.",
    personality: ["Leal", "Protetor", "Calmo"],
    medicalInfo: "Saudável.",
    images: ["https://images.unsplash.com/photo-1568572933382-74d440642117"],
  },
  {
    id: "8",
    name: "Nina",
    species: "cat",
    age: "3 anos",
    size: "pequeno",
    sex: "fêmea",
    status: "available",
    description:
      "Nina é uma felina elegante e carinhosa. Adora um cantinho quentinho para dormir.",
    personality: ["Elegante", "Carinhosa", "Sonolenta"],
    medicalInfo: "Vacinada e castrada.",
    images: [
      "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e",
      "https://images.unsplash.com/photo-1513245543132-31f507417b26",
    ],
  },
]
