import { useCallback, useEffect, useId, useRef, useState } from "react"
import { parseLinkHeader } from "./parseLinkHeader"

const LIMIT = 10

function App() {
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const id = useId()
  const nextPhotoUrlRef = useRef()

  async function fetchPhotos(url, { overwrite = false } = {}) {
    setIsLoading(true)
    try {
      const res = await fetch(url)
      nextPhotoUrlRef.current = parseLinkHeader(res.headers.get("Link")).next
      const photos = await res.json()

      if (overwrite) {
        setPhotos(photos)
      } else {
        setPhotos((prevPhotos) => [...prevPhotos, ...photos])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const imageRef = useCallback((image) => {
    if (image == null || nextPhotoUrlRef == null) return

    // inicializamos el observador para observar el último elemento img visible hasta el momento
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchPhotos(nextPhotoUrlRef.current)
        observer.unobserve(image)
      }
    })

    observer.observe(image)
  }, [])

  useEffect(() => {
    fetchPhotos(
      `http://localhost:3000/photos-short-list?_page=1&_limit=${LIMIT}`,
      {
        overwrite: true,
      }
    )
  }, [])

  // las imágenes no van a cargarse hasta que se complete el fetch
  // mientras esto último se cumple, isLoading va a estar en 'true' y se visualizará el array de divs skeleton
  return (
    <div className="grid">
      {photos.map((photo, index) => (
        <img
          key={`${id}-${photo.id}`}
          src={photo.url}
          alt={photo.title}
          ref={index === photos.length - 1 ? imageRef : undefined}
        />
      ))}
      {isLoading &&
        Array.from({ length: LIMIT }, (_, index) => index).map((n) => {
          return (
            <div key={n} className="skeleton">
              Loading...
            </div>
          )
        })}
    </div>
  )
}

export default App
