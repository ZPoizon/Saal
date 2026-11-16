import { Mail, Phone, Instagram, MapPin, Send, Facebook } from "lucide-react"

import { useState } from "react"

import { useSiteSettings } from "../contexts/SiteSettingsContext"

import {
  getMailHref,
  getPhoneHref,
  getPublicLocation,
  getWhatsAppHref,
} from "../data/siteLinks"

export function Contact() {
  const { settings } = useSiteSettings()

  const { contact } = settings

  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    name: "",

    email: "",

    subject: "",

    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitted(true)

    setTimeout(() => {
      setSubmitted(false)

      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 3000)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    })
  }

  const phoneHref = getPhoneHref(contact.phone)

  const whatsappHref = getWhatsAppHref(contact.whatsapp)

  const emailHref = getMailHref(contact.email)

  const publicLocation = getPublicLocation(contact)

  return (
    <div className="min-h-screen bg-[#F5EFE6] py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2E7D6B] mb-4">
            Entre em Contato
          </h1>
          <p className="text-[#6FAE9C] max-w-2xl mx-auto">
            Tem alguma dúvida ou quer saber mais sobre nosso trabalho? Estamos
            aqui para ajudar!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            {(phoneHref || whatsappHref) && (
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div>
                  <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2E7D6B] mb-2">
                      Telefone / WhatsApp
                    </h3>
                    {phoneHref && (
                      <a
                        href={phoneHref}
                        className="block text-[#6FAE9C] hover:text-[#E4B04A] transition-colors"
                      >
                        {contact.phone}
                      </a>
                    )}
                    {whatsappHref && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block text-sm font-medium text-[#2E7D6B] hover:text-[#E4B04A]"
                      >
                        Conversar pelo WhatsApp
                      </a>
                    )}
                    {contact.hours && (
                      <p className="text-sm text-gray-500 mt-1">
                        {contact.hours}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {emailHref && (
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2E7D6B] mb-2">
                      E-mail
                    </h3>
                    <a
                      href={emailHref}
                      className="text-[#6FAE9C] hover:text-[#E4B04A] transition-colors"
                    >
                      {contact.email}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      Respondemos em até 24 horas
                    </p>
                  </div>
                </div>
              </div>
            )}

            {contact.instagram && (
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2E7D6B] mb-2">
                      Instagram
                    </h3>
                    <a
                      href={contact.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6FAE9C] hover:text-[#E4B04A] transition-colors"
                    >
                      {contact.instagram

                        .replace(
                          /^https:\/\/(www\.)?instagram\.com\/?/,

                          "@",
                        )

                        .replace(/\/$/, "")}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      Acompanhe nosso dia a dia
                    </p>
                  </div>
                </div>
              </div>
            )}

            {contact.facebook && (
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center flex-shrink-0">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2E7D6B] mb-2">
                      Facebook
                    </h3>
                    <a
                      href={contact.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6FAE9C] hover:text-[#E4B04A] transition-colors"
                    >
                      Acompanhe nossa página
                    </a>
                  </div>
                </div>
              </div>
            )}

            {publicLocation && (
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2E7D6B] mb-2">
                      Localização
                    </h3>
                    <p className="whitespace-pre-line text-[#6FAE9C]">
                      {publicLocation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[#2E7D6B] mb-6">
              Envie uma Mensagem
            </h2>

            {submitted ? (
              <div className="bg-[#2E7D6B] text-white rounded-xl p-6 text-center">
                <Send className="w-12 h-12 mx-auto mb-3" />
                <p className="font-semibold">Mensagem enviada com sucesso!</p>
                <p className="text-sm mt-1 text-[#F5EFE6]">
                  Entraremos em contato em breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Seu nome"
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
                  <label
                    htmlFor="subject"
                    className="block text-[#2E7D6B] mb-2"
                  >
                    Assunto *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                    placeholder="Como podemos ajudar?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-[#2E7D6B] mb-2"
                  >
                    Mensagem *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A] resize-none"
                    placeholder="Escreva sua mensagem aqui..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#E4B04A] text-white py-4 rounded-full font-semibold hover:bg-[#d4a03a] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Enviar Mensagem
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
