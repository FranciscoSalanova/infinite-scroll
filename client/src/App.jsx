import { useEffect, useId, useState } from 'react'

function App() {
  const [photos, setPhotos] = useState([])
  const id = useId()

  useEffect(() => {
    fetch('http://localhost:3000/photos?_page=1&_limit=10')
      .then((res) => res.json())
      .then(setPhotos)
  }, [])

  return (
    <div className="grid">
      {photos.map((photo) => (
        <img src={photo.url} key={`${id}-${photo.id}`} />
      ))}
    </div>
  )
}

export default App
