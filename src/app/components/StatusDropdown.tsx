import { useEffect, useLayoutEffect, useRef, useState } from "react"

import type { ReactNode } from "react"

import { createPortal } from "react-dom"

import { Check, ChevronDown } from "lucide-react"

interface StatusOption {
  value: "available" | "adopted"
  label: string
  icon?: ReactNode
}

interface StatusDropdownProps {
  value: "available" | "adopted"
  options: StatusOption[]
  onChange: (value: "available" | "adopted") => void
  disabled?: boolean
  buttonClassName?: string
}

const MENU_GAP = 4
/** Margem mínima entre o menu e as bordas da viewport. */
const VIEWPORT_MARGIN = 8

export function StatusDropdown({
  value,
  options,
  onChange,
  disabled = false,
  buttonClassName,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mede o menu já renderizado e posiciona antes da primeira pintura,
  // evitando abrir para cima com uma altura estimada incorreta.
  useLayoutEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const button = buttonRef.current

      if (!button) return

      const rect = button.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const menuHeight = menuRef.current?.offsetHeight ?? 0
      const spaceBelow = viewportHeight - rect.bottom
      const openUpward =
        spaceBelow < menuHeight + MENU_GAP && rect.top > menuHeight + MENU_GAP

      const left = Math.max(
        VIEWPORT_MARGIN,
        Math.min(rect.left, viewportWidth - rect.width - VIEWPORT_MARGIN),
      )

      setPosition({
        top: openUpward
          ? Math.max(VIEWPORT_MARGIN, rect.top - menuHeight - MENU_GAP)
          : rect.bottom + MENU_GAP,
        left,
        width: rect.width,
        openUpward,
      })
    }

    updatePosition()

    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current?.contains(event.target as Node) ||
        menuRef.current?.contains(event.target as Node)
      ) {
        return
      }
      setIsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev)
    }
  }

  const handleSelect = (optionValue: "available" | "adopted") => {
    onChange(optionValue)
    setIsOpen(false)
    buttonRef.current?.focus()
  }

  const menuStyle: React.CSSProperties = {
    position: "fixed",
    top: position.top,
    left: position.left,
    width: position.width,
    zIndex: 100,
  }

  const selected = options.find((option) => option.value === value)

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={buttonClassName}
      >
        {selected?.icon}
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        mounted &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            style={menuStyle}
            className="rounded-2xl border border-[#e6eee9] bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-[#2E7D6B]/10 text-[#2E7D6B] font-semibold"
                      : "text-[#4b5563] hover:bg-[#F5EFE6] hover:text-[#2E7D6B]"
                  }`}
                >
                  {option.icon}
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="ml-auto w-4 h-4 text-[#2E7D6B]" />
                  )}
                </li>
              )
            })}
          </ul>,
          document.body,
        )}
    </>
  )
}
