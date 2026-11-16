import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"

import { Link } from "react-router"

import logoSaal from "../../imports/logo_fundo_0.png"

import { useSiteSettings } from "../contexts/SiteSettingsContext"

import {
  getMailHref,
  getPhoneHref,
  getPublicLocation,
  getWhatsAppHref,
  isAllowedPublicUrl,
} from "../data/siteLinks"

export function Footer() {
  const { settings } = useSiteSettings()

  const { contact, about } = settings

  const phoneHref = getPhoneHref(contact.phone)

  const whatsappHref = getWhatsAppHref(contact.whatsapp)

  const emailHref = getMailHref(contact.email)

  const location = getPublicLocation(contact)

  return (
    <footer className="bg-[#2E7D6B] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Missão */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoSaal}
                alt="SAAL"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h3 className="font-semibold">SAAL</h3>
                <p className="text-xs text-[#F5EFE6]">
                  Santuário de Animais Anjos da Luz
                </p>
              </div>
            </div>
            <p className="whitespace-pre-line text-sm text-[#F5EFE6]">
              {about.institutionalText}
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors"
              >
                Início
              </Link>
              <Link
                to="/animais"
                className="text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors"
              >
                Animais para Adoção
              </Link>
              <Link
                to="/contato"
                className="text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors"
              >
                Contato
              </Link>
              <Link
                to="/admin"
                className="text-sm text-[#E4B04A] hover:text-white transition-colors font-semibold mt-2"
              >
                Área Administrativa
              </Link>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="flex flex-col gap-3">
              {phoneHref && (
                <a
                  href={phoneHref}
                  className="flex items-center gap-2 text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors"
                >
                  <Phone size={16} />
                  {contact.phone}
                </a>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors"
                >
                  WhatsApp
                </a>
              )}
              {emailHref && (
                <a
                  href={emailHref}
                  className="flex items-center gap-2 text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors"
                >
                  <Mail size={16} />
                  {contact.email}
                </a>
              )}
              {isAllowedPublicUrl(contact.instagram) && (
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors"
                >
                  <Instagram size={16} />
                  {contact.instagram
                    .replace(/^https:\/\/(www\.)?instagram\.com\/?/, "@")
                    .replace(/\/$/, "")}
                </a>
              )}
              {isAllowedPublicUrl(contact.facebook) && (
                <a
                  href={contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors"
                >
                  <Facebook size={16} />
                  Facebook
                </a>
              )}
              {location && (
                <div className="flex items-start gap-2 text-sm text-[#F5EFE6]">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{location}</span>
                </div>
              )}
              {contact.hours && (
                <p className="text-xs text-[#F5EFE6]">{contact.hours}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#6FAE9C] mt-8 pt-6 text-center text-sm text-[#F5EFE6]">
          <p>
            © {new Date().getFullYear()} SAAL - Santuário de Animais Anjos da
            Luz. Todos os direitos reservados.
          </p>
          <p className="text-xs mt-1 text-[#6FAE9C]">
            ONG sem fins lucrativos
            {contact.city
              ? ` • ${contact.city}${
                  contact.state ? ` - ${contact.state}` : ""
                }`
              : ""}
          </p>
        </div>
      </div>
    </footer>
  )
}
