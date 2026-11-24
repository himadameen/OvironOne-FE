import type { BaseUnitKind, DisplayUnit } from '@/inventory/types'

const ML_PER_L = 1000
const G_PER_KG = 1000

export const DISPLAY_UNITS: DisplayUnit[] = ['L', 'ml', 'kg', 'g', 'nos']

export function unitsForKind(kind: BaseUnitKind): DisplayUnit[] {
  if (kind === 'volume') return ['L', 'ml']
  if (kind === 'mass') return ['kg', 'g']
  return ['nos']
}

/** Units shown on qty fields — includes L↔kg when density is set. */
export function unitsForQuantityInput(
  kind: BaseUnitKind,
  densityKgPerL?: number
): DisplayUnit[] {
  const base = unitsForKind(kind)
  if (kind === 'volume' && densityKgPerL) return [...base, 'kg', 'g']
  if (kind === 'mass' && densityKgPerL) return [...base, 'L', 'ml']
  return base
}

export function convertToBase(
  qty: number,
  unit: DisplayUnit,
  kind: BaseUnitKind,
  densityKgPerL?: number
): number {
  if (kind === 'count') {
    if (unit !== 'nos') {
      throw new Error('Only nos unit is allowed for count-based products.')
    }
    return qty
  }
  if (kind === 'volume') {
    if (unit === 'L') return qty * ML_PER_L
    if (unit === 'ml') return qty
    if (unit === 'kg' || unit === 'g') {
      if (!densityKgPerL) {
        throw new Error('Density (kg/L) is required to convert between volume and mass.')
      }
      const litres = unit === 'kg' ? qty / densityKgPerL : qty / G_PER_KG / densityKgPerL
      return litres * ML_PER_L
    }
    throw new Error(`Unit ${unit} is not valid for volume products.`)
  }
  if (unit === 'kg') return qty * G_PER_KG
  if (unit === 'g') return qty
  if (unit === 'L' || unit === 'ml') {
    if (!densityKgPerL) {
      throw new Error('Density (kg/L) is required to convert between mass and volume.')
    }
    const kg = unit === 'L' ? qty * densityKgPerL : (qty / ML_PER_L) * densityKgPerL
    return kg * G_PER_KG
  }
  throw new Error(`Unit ${unit} is not valid for mass products.`)
}

export function convertFromBase(
  baseQty: number,
  unit: DisplayUnit,
  kind: BaseUnitKind,
  densityKgPerL?: number
): number {
  if (kind === 'count') {
    if (unit !== 'nos') {
      throw new Error('Only nos unit is allowed for count-based products.')
    }
    return baseQty
  }
  if (kind === 'volume') {
    const ml = baseQty
    if (unit === 'ml') return ml
    if (unit === 'L') return ml / ML_PER_L
    if (unit === 'kg' || unit === 'g') {
      if (!densityKgPerL) {
        throw new Error('Density (kg/L) is required to convert between volume and mass.')
      }
      const kg = (ml / ML_PER_L) * densityKgPerL
      return unit === 'kg' ? kg : kg * G_PER_KG
    }
    throw new Error(`Unit ${unit} is not valid for volume products.`)
  }
  const grams = baseQty
  if (unit === 'g') return grams
  if (unit === 'kg') return grams / G_PER_KG
  if (unit === 'L' || unit === 'ml') {
    if (!densityKgPerL) {
      throw new Error('Density (kg/L) is required to convert between mass and volume.')
    }
    const kg = grams / G_PER_KG
    const litres = kg / densityKgPerL
    return unit === 'L' ? litres : litres * ML_PER_L
  }
  throw new Error(`Unit ${unit} is not valid for mass products.`)
}

export function formatQty(qty: number, unit: DisplayUnit, fractionDigits = 2): string {
  const rounded =
    unit === 'nos' ? String(Math.round(qty)) : qty.toFixed(fractionDigits).replace(/\.?0+$/, '')
  return `${rounded} ${unit}`
}

export function conversionHint(
  qty: number,
  unit: DisplayUnit,
  kind: BaseUnitKind,
  densityKgPerL?: number
): string | null {
  try {
    const base = convertToBase(qty, unit, kind, densityKgPerL)
    if (kind === 'volume') {
      const alt = convertFromBase(base, unit === 'L' ? 'ml' : 'L', kind, densityKgPerL)
      const altUnit = unit === 'L' ? 'ml' : 'L'
      return `≈ ${formatQty(alt, altUnit)}`
    }
    if (kind === 'mass') {
      const alt = convertFromBase(base, unit === 'kg' ? 'g' : 'kg', kind, densityKgPerL)
      const altUnit = unit === 'kg' ? 'g' : 'kg'
      return `≈ ${formatQty(alt, altUnit)}`
    }
    return null
  } catch {
    return null
  }
}