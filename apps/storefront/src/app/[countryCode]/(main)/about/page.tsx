import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BookOpen, Headphones, ShieldCheck, Heart, Sparkles, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "About the Author & Bookstore | Ayodeji Anifowose",
  description: "Discover the story behind Ayodeji Anifowose Bookstore, our literary mission, and our passion for timeless family, marriage, and personal development books.",
}

export default async function AboutPage() {
  return (
    <div className="py-12 md:py-20 bg-[#FAF9F6]/40 min-h-screen">
      <div className="content-container max-w-4xl">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-[#980000]/10 text-[#980000] text-[11px] font-extrabold uppercase tracking-widest mb-3">
            Our Story & Mission
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#382C2C] tracking-tight mb-6 leading-tight">
            Empowering Minds, Inspiring Families
          </h1>
          <p className="text-sm sm:text-base text-[#4D4C4C] leading-relaxed">
            Ayodeji Anifowose Bookstore is a dedicated literary hub established to provide readers worldwide with life-transforming books across family, marriage, children’s inspiration, and personal mastery.
          </p>
        </div>

        {/* Story Content */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-10">
          {/* Section 1: The Author */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#980000] font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>About Ayodeji Anifowose</span>
            </div>
            <h2 className="text-2xl font-black text-[#382C2C]">
              A Passion for Meaningful Storytelling
            </h2>
            <p className="text-xs sm:text-sm text-[#4D4C4C] leading-relaxed">
              Ayodeji Anifowose is an accomplished author, speaker, and thought leader whose works center around strengthening relationships, nurturing emotional intelligence in children, and unlocking human potential. Through evocative prose and actionable wisdom, each title is crafted to provide readers with enduring insights that transcend generations.
            </p>
            <p className="text-xs sm:text-sm text-[#4D4C4C] leading-relaxed">
              Whether penning heartwarming tales for young minds like <em>Trick or Treat, Daddy</em>, or unpacking the sacred nuances of enduring relationships, Ayodeji’s literary portfolio bridges deep empathy with practical principles.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Format Philosophy */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[#980000] font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>The Multi-Format Reading Experience</span>
            </div>
            <h2 className="text-2xl font-black text-[#382C2C]">
              Read and Listen the Way You Love
            </h2>
            <p className="text-xs sm:text-sm text-[#4D4C4C] leading-relaxed">
              We believe great literature should be accessible wherever you are. That is why our titles are thoughtfully engineered in three complementary editions:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-gray-100 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#980000] flex items-center justify-center font-bold">
                  <Headphones className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-[#382C2C]">Narrated Audiobooks</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Professionally mastered audio streaming with chapter bookmarks and speed control, accessible instantly on your phone or computer.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-gray-100 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#980000] flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-[#382C2C]">Instant eBooks</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  A clean, typography-focused browser reader with adjustable fonts and day/night contrast, saved directly to your account.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-gray-100 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#980000] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-[#382C2C]">Print Editions</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Archival-grade Hardcover and Paperback printings, meticulously bound for home libraries, gifts, and bedside reading.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: Reader Commitment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#980000] font-bold text-xs uppercase tracking-wider">
              <Heart className="w-4 h-4" />
              <span>Our Promise to You</span>
            </div>
            <h2 className="text-2xl font-black text-[#382C2C]">
              Uncompromising Quality & Care
            </h2>
            <p className="text-xs sm:text-sm text-[#4D4C4C] leading-relaxed">
              Every order placed directly through this bookstore directly supports independent authorship. We are committed to fast order dispatch, secure digital delivery, responsive reader support, and regular updates to our growing digital catalog.
            </p>
          </div>

          {/* Call to action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-[#980000] text-white">
            <div>
              <h4 className="font-bold text-sm">Ready to start reading?</h4>
              <p className="text-xs text-white/80">Explore our collection of bestselling physical and digital books.</p>
            </div>
            <LocalizedClientLink
              href="/store"
              className="px-6 py-2.5 bg-white text-[#980000] font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap shadow-sm"
            >
              Browse the Bookstore &rarr;
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
