import {set, unset} from 'sanity'
import type {StringInputProps} from 'sanity'

const BRAND_COLORS = [
  {label: 'Earth 700', value: '#452a1d'},
  {label: 'Forest 400', value: '#465546'},
  {label: 'Ink 900', value: '#252525'},
  {label: 'Khaki 100', value: '#eae4da'},
  {label: 'Khaki 200', value: '#e0d6c8'},
  {label: 'Khaki 300', value: '#cbbaa4'},
  {label: 'Lilac 200', value: '#d5c7d0'},
  {label: 'Mustard 500', value: '#cc9c00'},
  {label: 'Prussian 100', value: '#d6dadb'},
  {label: 'Prussian 200', value: '#b1bdc2'},
  {label: 'Prussian 500', value: '#1f5168'},
  {label: 'Prussian 700', value: '#20404f'},
  {label: 'Sand 050', value: '#efebe9'},
  {label: 'Sand 100', value: '#e7e1dd'},
  {label: 'Sand 200', value: '#ded6d2'},
]

export function ColorSwatchInput(props: StringInputProps) {
  const {value, onChange, readOnly} = props

  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 0'}}>
      {BRAND_COLORS.map((color) => {
        const selected = value === color.value
        return (
          <button
            key={color.value}
            title={`${color.label} — ${color.value}`}
            disabled={!!readOnly}
            onClick={() => onChange(selected ? unset() : set(color.value))}
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              backgroundColor: color.value,
              border: selected ? '3px solid #2276fc' : '2px solid rgba(0,0,0,0.15)',
              cursor: readOnly ? 'default' : 'pointer',
              outline: selected ? '2px solid #2276fc' : 'none',
              outlineOffset: 2,
              transition: 'outline 0.1s, border 0.1s',
            }}
          />
        )
      })}
    </div>
  )
}
