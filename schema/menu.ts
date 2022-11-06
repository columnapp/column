import { makeExtensibleSchema, makeFunctionWithAPICell, makeFunctionWithAPIColumn } from 'schema/shared'
import { z, ZodType } from 'zod'

export function makeCellMenuSchema<V extends ZodType>(valueSchema: V) {
  return makeExtensibleSchema().and(
    z.object({
      /** text to be rendered as menu option */
      label: z.string(),
      action: makeFunctionWithAPICell(valueSchema, z.void()),
    }),
  )
}
export function makeColumnMenuSchema<V extends ZodType>(valueSchema: V) {
  return makeExtensibleSchema().and(
    z.object({
      /** text to be rendered as menu option */
      label: z.string(),
      action: makeFunctionWithAPIColumn(valueSchema, z.void()),
    }),
  )
}
