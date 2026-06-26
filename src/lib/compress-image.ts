export function compressImage(file: File, maxWidth = 2000, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = Math.round(height * maxWidth / width)
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Falha ao comprimir imagem'))
      }, 'image/jpeg', quality)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
