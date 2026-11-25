import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PAINT_BASE_SWATCHES } from '@/inventory/paint-base-colors'
import { fetchMonochromeFamily, type ColorSwatch } from '@/inventory/color-family'
import { cn } from '@/lib/utils'

interface ShadeColorPickerProps {
  shadeName: string
  shadeHex: string
  onShadeNameChange: (name: string) => void
  onShadeHexChange: (hex: string) => void
  error?: string
}

export function ShadeColorPicker({
  shadeName,
  shadeHex,
  onShadeNameChange,
  onShadeHexChange,
  error,
}: ShadeColorPickerProps) {
  const [family, setFamily] = useState<ColorSwatch[]>([])
  const [loading, setLoading] = useState(false)
  const [familyError, setFamilyError] = useState<string | null>(null)

  const loadFamily = async () => {
    setLoading(true)
    setFamilyError(null)
    try {
      const swatches = await fetchMonochromeFamily(shadeHex, 6)
      setFamily(swatches)
    } catch {
      setFamilyError('Online tints unavailable — use hex or swatches below.')
      setFamily([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="shade-picker">
      <div className="shade-picker-row">
        <label className="stock-form-field">
          <span className="stock-form-label">Shade name</span>
          <input
            className="stock-form-input"
            value={shadeName}
            onChange={(e) => onShadeNameChange(e.target.value)}
            placeholder="e.g. Ivory Mist"
          />
        </label>
        <label className="stock-form-field shade-picker-hex">
          <span className="stock-form-label">Hex</span>
          <div className="shade-picker-hex-row">
            <input
              type="color"
              className="shade-picker-native"
              value={shadeHex}
              onChange={(e) => onShadeHexChange(e.target.value.toUpperCase())}
              aria-label="Pick colour"
            />
            <input
              className="stock-form-input tabular-nums"
              value={shadeHex}
              onChange={(e) => onShadeHexChange(e.target.value)}
              placeholder="#E8E2D4"
              spellCheck={false}
            />
          </div>
        </label>
      </div>
      {error ? <span className="stock-form-error">{error}</span> : null}

      <p className="shade-picker-hint">Base swatches — tints can be suggested from hex via The Color API.</p>
      <div className="shade-picker-swatches">
        {PAINT_BASE_SWATCHES.map((s) => (
          <button
            key={s.hex}
            type="button"
            className={cn('shade-picker-chip', shadeHex.toUpperCase() === s.hex.toUpperCase() && 'shade-picker-chip--on')}
            onClick={() => {
              onShadeHexChange(s.hex)
              if (!shadeName.trim()) onShadeNameChange(s.name)
            }}
            title={s.name}
          >
            <span className="shade-picker-chip-dot" style={{ backgroundColor: s.hex }} aria-hidden />
            <span className="shade-picker-chip-label">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="shade-picker-api">
        <button type="button" className="btn-secondary !h-9 px-3 text-xs" onClick={loadFamily} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Suggest tints from hex
        </button>
        {familyError ? <p className="shade-picker-api-msg">{familyError}</p> : null}
      </div>

      {family.length > 0 ? (
        <ul className="shade-picker-family">
          {family.map((s) => (
            <li key={s.hex}>
              <button
                type="button"
                className="shade-picker-family-btn"
                onClick={() => {
                  onShadeHexChange(s.hex)
                  onShadeNameChange(s.name)
                }}
              >
                <span className="shade-picker-chip-dot" style={{ backgroundColor: s.hex }} aria-hidden />
                <span className="shade-picker-family-name">{s.name}</span>
                <span className="shade-picker-family-hex tabular-nums">{s.hex}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
