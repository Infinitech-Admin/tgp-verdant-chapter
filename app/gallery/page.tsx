"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Image as ImageIcon, Calendar } from "lucide-react"
import PageLayout from "@/components/page-layout"
import { useState, useEffect } from "react"

interface Gallery {
  id: number
  title: string
  description?: string
  image_url: string
  type?: string
  // created_at: string
  updated_at?: string
}

export default function GalleryPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [galleriesLoading, setGalleriesLoading] = useState(true)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<Gallery | null>(null)

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setGalleriesLoading(true)
        console.log("[Gallery] 🖼️ Fetching galleries from: /api/galleries")
        
        const res = await fetch("/api/galleries?per_page=100")
        console.log("[Gallery] 📡 Gallery Response status:", res.status)
        
        const data = await res.json()
        console.log("[Gallery] 📦 Gallery API response:", data)

        if (data.success) {
          let galleriesData: Gallery[] = []
          
          if (Array.isArray(data.data)) {
            galleriesData = data.data
          } else if (data.data && Array.isArray(data.data.data)) {
            galleriesData = data.data.data
          } else if (data.data && typeof data.data === 'object') {
            galleriesData = [data.data]
          }
          
          console.log("[Gallery] 🖼️ Processed galleries data:", galleriesData)
          console.log("[Gallery] 🖼️ Number of galleries:", galleriesData.length)
          setGalleries(galleriesData)
        } else {
          console.error("[Gallery] ❌ Gallery API returned success: false")
        }
      } catch (err) {
        console.error("[Gallery] 💥 Error fetching galleries:", err)
      } finally {
        setGalleriesLoading(false)
      }
    }

    fetchGalleries()
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedGalleryImage(null)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  useEffect(() => {
    if (selectedGalleryImage) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [selectedGalleryImage])

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) {
      console.log("[Gallery] ⚠️ No image URL provided")
      return ""
    }
    
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      console.log("[Gallery] 🔗 Using full URL:", imageUrl)
      return imageUrl
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"
    const fullUrl = imageUrl.startsWith("/") 
      ? `${baseUrl}${imageUrl}` 
      : `${baseUrl}/${imageUrl}`
    
    console.log("[Gallery] 🔗 Built image URL:", fullUrl)
    return fullUrl
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <PageLayout
      title="Photo Gallery"
      subtitle="Capturing moments and memories from our community"
      image="/newspaper-journalism-city-news.jpg"
    >
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {galleriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="aspect-square rounded-2xl bg-gradient-to-br from-red-200 via-orange-200 to-green-200 animate-pulse" 
              />
            ))}
          </div>
        ) : galleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleries.map((gallery, i) => (
              <motion.div
                key={gallery.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -8 }}
                onClick={() => setSelectedGalleryImage(gallery)}
                className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-gray-100 hover:border-orange-300 group"
              >
                <div className="relative w-full h-full">
                  <img
                    src={getImageUrl(gallery.image_url)}
                    alt={gallery.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      console.error("[Gallery] ❌ Failed to load image:", gallery.image_url)
                      e.currentTarget.src = ""
                      e.currentTarget.style.display = "none"
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center"><span class="text-4xl">🖼️</span></div>`
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-bold text-sm line-clamp-2 mb-2">
                        {gallery.title}
                      </p>
                      {/* <div className="flex items-center gap-2 text-white/80 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(gallery.created_at)}</span>
                      </div> */}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">No gallery images available at the moment.</p>
            </div>
          </div>
        )}
      </section>

      {/* Gallery Image Modal */}
      <AnimatePresence>
        {selectedGalleryImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGalleryImage(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedGalleryImage(null)}
              className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-700" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full"
            >
              <img
                src={getImageUrl(selectedGalleryImage.image_url)}
                alt={selectedGalleryImage.title}
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
                <h3 className="text-white text-2xl font-bold mb-2">
                  {selectedGalleryImage.title}
                </h3>
                {selectedGalleryImage.description && (
                  <p className="text-white/90 text-sm mb-2">
                    {selectedGalleryImage.description}
                  </p>
                )}
                {/* <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedGalleryImage.created_at)}</span>
                </div> */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  )
}
