export function getAnimalImageUrl(image: string, dimensions: string): string {
  if (!image || image.startsWith("data:")) return image

  const separator = image.includes("?") ? "&" : "?"

  return `${image}${separator}${dimensions}`
}
