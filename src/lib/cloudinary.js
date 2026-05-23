// Sube una imagen a Cloudinary directamente desde el navegador
// No necesita backend ni API Secret — usa unsigned upload preset

export async function subirImagen(archivo, carpeta = 'perfiles') {
  const cloudName   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  const formData = new FormData()
  formData.append('file', archivo)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', carpeta)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Error al subir la imagen')
  }

  const data = await res.json()
  // Retorna la URL segura de la imagen ya optimizada
  return data.secure_url
}

// Genera URL optimizada de Cloudinary con tamaño y calidad automáticos
export function urlOptimizada(url, { width = 400, height = 400 } = {}) {
  if (!url) return null
  // Inserta transformaciones en la URL de Cloudinary
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`)
}
