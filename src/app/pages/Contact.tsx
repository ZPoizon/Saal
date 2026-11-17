import { Facebook, Mail, MapPin, Phone, Instagram } from "lucide-react"

import { useSiteSettings } from "../contexts/SiteSettingsContext"

import {
  getMailHref,
  getPhoneHref,
  getPublicLocation,
  getWhatsAppHref,
  isAllowedPublicUrl,
} from "../data/siteLinks"

export function Contact() {
  const { settings } = useSiteSettings()

  const { contact } = settings

  const phoneHref = getPhoneHref(contact.phone)

  const whatsappHref = getWhatsAppHref(contact.whatsapp)

  const emailHref = getMailHref(contact.email)

  const location = getPublicLocation(contact)

  return (
    <div className="min-h-screen bg-[#F5EFE6] py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="mb-4 text-3xl font-bold text-[#2E7D6B] sm:text-4xl md:text-5xl">
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
              <div className="rounded-2xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#2E7D6B] mb-2">
                      Telefone / WhatsApp
                    </h3>
                    {phoneHref && (
                      <a
                        href={phoneHref}
                        className="block text-[#6FAE9C] transition-colors hover:text-[#E4B04A]"
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
                      <p className="mt-1 text-sm text-gray-500">
                        {contact.hours}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {emailHref && (
              <div className="rounded-2xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
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

            {isAllowedPublicUrl(contact.instagram) && (
              <div className="rounded-2xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
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
                        .replace(/^https:\/\/(www\.)?instagram\.com\/?/, "@")
                        .replace(/\/$/, "")}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      Acompanhe nosso dia a dia
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isAllowedPublicUrl(contact.facebook) && (
              <div className="rounded-2xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#E4B04A]">
                    <Facebook className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-2 font-semibold text-[#2E7D6B]">
                      Facebook
                    </h3>
                    <a
                      href={contact.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6FAE9C] transition-colors hover:text-[#E4B04A]"
                    >
                      Acompanhe nossa página
                    </a>
                  </div>
                </div>
              </div>
            )}

            {location && (
              <div className="rounded-2xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E4B04A] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#2E7D6B] mb-2">
                      Localização
                    </h3>
                    <p className="whitespace-pre-line text-[#6FAE9C]">
                      {location}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl bg-white p-4 shadow-lg sm:p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#2E7D6B] mb-6">
              Envie uma Mensagem
            </h2>

            <form
              onSubmit={(event) => event.preventDefault()}
              className="space-y-4"
            >
              <p
                role="status"
                className="rounded-lg border border-[#E4B04A]/50 bg-[#F5EFE6] p-3 text-sm text-[#416f65]"
              >
                O formulário está indisponível até a aprovação e integração do
                canal. Nada será enviado ou persistido pelo SAAL.
              </p>
              <div>
                <label htmlFor="name" className="block text-[#2E7D6B] mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="Seu nome"
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
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="seu.email@exemplo.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-[#2E7D6B] mb-2">
                  Assunto
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
                  placeholder="Como podemos ajudar?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[#2E7D6B] mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A] resize-none"
                  placeholder="Escreva sua mensagem aqui..."
                />
              </div>

              <button
                type="button"
                disabled
                className="flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full bg-[#E4B04A] py-4 font-semibold text-white opacity-60 shadow-md"
              >
                Envio indisponível nesta versão
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
