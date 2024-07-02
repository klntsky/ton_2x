export const typeGuardByFields = <GType>(
  value: unknown,
  fields: (keyof GType)[],
): value is GType => {
  return fields.every(field => {
    try {
      ;(value as GType)[field]
      return true
    } catch (error) {
      return false
    }
  })
}
