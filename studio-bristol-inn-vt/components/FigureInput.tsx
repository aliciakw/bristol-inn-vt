import type {ObjectInputProps} from 'sanity'

export const figureOptionalItemNames = ['caption', 'rounded', 'layout'] as const

export type FigureOptionalItemName = (typeof figureOptionalItemNames)[number]

type FigureOptions = {
  hiddenItems?: FigureOptionalItemName[]
}

export function FigureInput(props: ObjectInputProps) {
  const options = props.schemaType.options as FigureOptions | undefined
  const hiddenItems = new Set(options?.hiddenItems ?? [])
  const members = props.members.filter(
    (member) => member.kind !== 'field' || !hiddenItems.has(member.name as FigureOptionalItemName),
  )

  return props.renderDefault({...props, members})
}
