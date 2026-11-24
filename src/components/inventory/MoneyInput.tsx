interface MoneyInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
  id?: string
  readOnly?: boolean
}

export function MoneyInput({
  value,
  onChange,
  label = 'Amount (₹)',
  id = 'money-input',
  readOnly,
}: MoneyInputProps) {
  return (
    <label className="block space-y-1">
      <span className="text-small font-medium text-muted">{label}</span>
      <input
        id={id}
        type="number"
        className="input-field !h-10"
        min={0}
        step={0.01}
        readOnly={readOnly}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}