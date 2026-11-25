/** The Color API — public, no key required for scheme lookup. */
export interface ColorSwatch {
  name: string
  hex: string
}

export async function fetchMonochromeFamily(hex: string, count = 5): Promise<ColorSwatch[]> {
  const clean = hex.replace('#', '')
  const url = `https://www.thecolorapi.com/scheme?hex=${encodeURIComponent(clean)}&mode=monochrome&count=${count}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Could not load colour family.')
  const data = (await res.json()) as {
    colors?: Array<{ hex: { value: string }; name: { value: string } }>
  }
  return (data.colors ?? []).map((c) => ({
    hex: c.hex.value,
    name: c.name.value,
  }))
}