"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

type Slide = {
  id: number
  tag: string
  heading: string
  description: string
  buttonText: string
  buttonHref: string
  rightHeader: string[]
  bookTitle: string
  bookSubtitle: string
  stockNote: string
  cardBg: string
  accentColor: string
}

const HERO_SLIDES: Slide[] = [
  {
    id: 0,
    tag: "Author of august",
    heading: "Ayodeji Anifowose",
    description:
      "Ayodeji Anifowose has been awarded more than 20 literary prizes and distinctions, and in 2001 he received the title of Chevalier des Arts et des Lettres. His books have been translated into over 40 languages.",
    buttonText: "View his books",
    buttonHref: "/store",
    rightHeader: ["AUTOGRAPHED", "BOOKS + 30%", "DISCOUNT"],
    bookTitle: "TRICK OR TREAT, DADDY",
    bookSubtitle: "WRITTEN BY ERIC-EMANUEL SCHMITT",
    stockNote: "*within the stock limit",
    cardBg: "bg-[#1b1c20]",
    accentColor: "text-amber-300",
  },
  {
    id: 1,
    tag: "Featured Bestseller",
    heading: "Oscar and the Lady in Pink",
    description:
      "One of Eric-Emanuel Schmitt's most celebrated international bestsellers. A deeply moving, inspiring tale about courage, hope, and humanity loved by millions of readers worldwide.",
    buttonText: "Read sample chapter",
    buttonHref: "/store",
    rightHeader: ["HARDCOVER", "COLLECTOR + 20%", "DISCOUNT"],
    bookTitle: "OSCAR & LADY IN PINK",
    bookSubtitle: "ACCLAIMED INTERNATIONAL BESTSELLER",
    stockNote: "*signed hardcover edition",
    cardBg: "bg-[#1e293b]",
    accentColor: "text-rose-300",
  },
  {
    id: 2,
    tag: "Audiobook Release",
    heading: "The Most Beautiful Book in the World",
    description:
      "Immerse yourself in Eric-Emanuel Schmitt's captivating audiobooks narrated with passion. Experience eight poignant stories celebrating life and unexpected love.",
    buttonText: "Listen to audiobook",
    buttonHref: "/store",
    rightHeader: ["AUDIOBOOK", "UNLIMITED + FREE", "PREVIEW"],
    bookTitle: "MOST BEAUTIFUL BOOK",
    bookSubtitle: "NARRATED AUTHOR EDITION",
    stockNote: "*instant digital stream",
    cardBg: "bg-[#0f172a]",
    accentColor: "text-emerald-300",
  },
]

const SLIDE_DURATION = 5000

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0)
  const [animatingFill, setAnimatingFill] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setAnimatingFill(false)
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimatingFill(true)
      })
    })

    if (isPaused) return () => cancelAnimationFrame(raf)

    const timer = setTimeout(() => {
      setActiveSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1))
    }, SLIDE_DURATION)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [activeSlide, isPaused])

  const selectSlide = (index: number) => {
    if (index === activeSlide) return
    setActiveSlide(index)
  }

  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1))
  }

  const current = HERO_SLIDES[activeSlide]

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full bg-white py-10 lg:py-14 relative overflow-hidden"
    >
      <div className="content-container flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left Column: 1px Line Indicators & Text Content */}
        <div className="flex items-stretch gap-x-5 flex-1 max-w-2xl">
          {/* Vertical 1px Line Segments with Gaps */}
          <div className="flex flex-col justify-between py-1 gap-y-3 flex-shrink-0">
            {HERO_SLIDES.map((_, i) => {
              const isActive = i === activeSlide
              const isPassed = i < activeSlide

              return (
                <button
                  key={i}
                  onClick={() => selectSlide(i)}
                  className="w-[1px] flex-1 min-h-[55px] bg-[#D19090] relative overflow-hidden rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                  title={`Go to slide ${i + 1}`}
                >
                  {/* Smooth 5s Hardware Accelerated CSS Fill Line (#980000) */}
                  <div
                    className={`absolute top-0 left-0 w-full bg-[#980000] rounded-full ${
                      isActive && animatingFill && !isPaused
                        ? "transition-all linear"
                        : "transition-none"
                    }`}
                    style={{
                      height: isActive
                        ? animatingFill && !isPaused
                          ? "100%"
                          : "0%"
                        : isPassed
                        ? "100%"
                        : "0%",
                      transitionDuration:
                        isActive && animatingFill && !isPaused
                          ? "5000ms"
                          : "0ms",
                    }}
                  />
                </button>
              )
            })}
          </div>

          {/* Left Text Content */}
          <div
            key={current.id}
            className="flex-1 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {/* Tag Box (#D19090) */}
            <div className="inline-block border border-[#D19090] px-3.5 py-1 rounded text-[13px] font-medium text-[#D19090]">
              {current.tag}
            </div>

            {/* Author / Book Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-[#382C2C] tracking-tight leading-tight">
              {current.heading}
            </h1>

            {/* Bio Description */}
            <p className="text-sm text-[#4D4C4C] leading-relaxed max-w-lg">
              {current.description}
            </p>

            {/* CTA Red Button */}
            <div className="pt-2">
              <LocalizedClientLink
                href={current.buttonHref}
                className="inline-flex items-center justify-center px-8 py-3 rounded bg-[#980000] text-white font-medium text-sm hover:bg-[#7a0000] transition-colors shadow-sm"
              >
                {current.buttonText}
              </LocalizedClientLink>
            </div>
          </div>
        </div>

        {/* Right Column: Featured Book Card */}
        <div
          key={`card-${current.id}`}
          className="flex-1 flex flex-col items-center lg:items-end w-full animate-in fade-in slide-in-from-right-3 duration-500"
        >
          <div className="flex gap-x-6 items-start">
            {/* Discount Header */}
            <div className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider space-y-1 pt-2">
              {current.rightHeader.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            {/* Book Cover Image Container */}
            <div className="flex flex-col items-end">
              <div
                className={`w-56 sm:w-64 h-80 sm:h-92 ${current.cardBg} rounded-md shadow-2xl overflow-hidden relative border border-gray-100 flex flex-col justify-between p-5 text-white transform hover:scale-[1.02] transition-transform`}
              >
                <div className="flex-1 flex flex-col justify-between border border-white/10 rounded p-4">
                  <h2
                    className={`text-2xl font-black italic tracking-tight font-serif text-center mt-2 drop-shadow-md ${current.accentColor}`}
                  >
                    {current.bookTitle}
                  </h2>
                  <div className="my-auto text-center py-4">
                    <div className="w-20 h-24 mx-auto rounded-xl border border-white/20 bg-white/5 flex items-center justify-center">
                      <Star className="w-10 h-10 text-amber-300 fill-amber-300" />
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-gray-300 tracking-wider font-sans uppercase font-medium">
                    {current.bookSubtitle}
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-gray-400 mt-2 font-normal">
                {current.stockNote}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Bottom Navigation Controls */}
      <div className="flex items-center justify-center gap-x-3 mt-8">
        <button
          onClick={handlePrev}
          className="w-9 h-9 rounded-full border border-red-300 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-[#980000] transition-colors"
          title="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          className="w-9 h-9 rounded-full border border-red-300 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-[#980000] transition-colors"
          title="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Hero
