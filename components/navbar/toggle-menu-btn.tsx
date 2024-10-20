'use client';

import { MenuContext } from "@/context/menu-provider"
import Image from "next/image"
import { useContext } from "react"

const ToggleMenuBtn = () => {
  const { toggleMenu } = useContext(MenuContext)
  return (
    <button
              onClick={() => toggleMenu()}
              className="flex gap-x-2 text-secondary-foreground dark:text-white items-center"
            >
              <Image
                src="/assets/icons/menu.svg"
                alt="Menu icon"
                height={24}
                className="invert dark:invert-0"
                width={24}
              />
              <p className="text-4xl font-logo text-secondary-foreground dark:text-white leading-none">
               Anix
              <span className="text-[#db1400]">Play</span>
              </p>
            </button>
  )
}
export default ToggleMenuBtn