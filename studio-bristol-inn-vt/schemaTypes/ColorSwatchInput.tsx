import {set, unset, type StringInputProps} from 'sanity';
import { Select } from '@sanity/ui'

const BRAND_COLORS = [
  {label: 'Sand 200', value: '#ded6d2'},
  {label: 'Sand 100', value: '#e7e1dd'},
  {label: 'Sand 050', value: '#efebe9'},
  {label: 'Ink 900', value: '#252525'},
  {label: 'Prussian 100', value: '#d6dadb'},
  {label: 'Prussian 200', value: '#b1bdc2'},
  {label: 'Prussian 500', value: '#1f5168'},
  {label: 'Prussian 700', value: '#20404f'},
  {label: 'Khaki 100', value: '#eae4da'},
  {label: 'Khaki 200', value: '#e0d6c8'},
  {label: 'Khaki 300', value: '#cbbaa4'},
  {label: 'Lilac 200', value: '#d5c7d0'},
  {label: 'Earth 700', value: '#452a1d'},
  {label: 'Forest 400', value: '#465546'},
  {label: 'Mustard 500', value: '#cc9c00'},
]

export function ColorSwatchInput(props: StringInputProps) {
  const {value, onChange, readOnly} = props
  const selectedColor = BRAND_COLORS.find((c) => c.value === value)

  return (
    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 24, maxWidth: 440}}>
      <Select
        value={value ?? ''}
        disabled={!!readOnly}
        onChange={(e) => {
          e.target.value ? onChange(set(e.target.value)) : onChange(unset())
        }}
        style={{
          padding: '6px 10px',
          borderRadius: 4,
          border: '1px solid rgba(0,0,0,0.2)',
          fontSize: 14,
          cursor: readOnly ? 'default' : 'pointer',
          backgroundColor: 'white',
          color: '#111',
          width: '100%',
          maxWidth: 220,
        }}
      >
        <option value="">— No color —</option>
        {BRAND_COLORS.map((color) => (
          <option key={color.value} value={color.value}>
            {color.label}
          </option>
        ))}
      </Select>

      {selectedColor && (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingLeft: 2}}>
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: selectedColor.value,
            border: '1px solid rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}
        />
        <span style={{fontSize: 14, color: '#efefef', fontFamily: 'monospace'}}>{selectedColor.value}</span>
      </div>
      )}
    </div>
  )
}
