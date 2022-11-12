import { DisplayInputSchema } from 'schema/display/input'
import { DisplayStaticSchema } from 'schema/display/static'
import { DisplayLayoutSchema } from 'schema/display/layout'
import { makeFunctionWithAPICell } from 'schema/shared'
import { z, ZodType } from 'zod'

/**
 * the separation between static vs input is done this way because the types need to be combined and
 * using z.intersection or InputSchema.and(StaticSchema) cannot be z.infer, so I end up having to
 * repeat the definition
 */
// export const DisplayFilterSchema = z.discriminatedUnion('type', [...FILTER_INPUT_TYPES])
// export const DisplayStaticSchema = z.discriminatedUnion('type', [...STATIC_SCHEMA_TYPES])
// export const DisplayInputSchema = z.discriminatedUnion('type', [...CELL_INPUT_TYPES])

export const DisplaySchema = z
  .union([
    DisplayInputSchema,
    DisplayStaticSchema,
    DisplayLayoutSchema,
    // this object recurses, so need to add it later
  ])
  .and(
    z.object({
      value: z.any(),
    }),
  )
export type DisplaySchema = z.infer<typeof DisplaySchema>

export function makeFormSchemaCell<V extends ZodType>(cellValueSchema: V) {
  return z.union([makeFunctionWithAPICell(cellValueSchema, DisplayInputSchema), DisplayInputSchema])
}

export function makeDisplaySchemaCell<V extends ZodType>(cellValueSchema: V) {
  return z.union([makeFunctionWithAPICell(cellValueSchema, DisplaySchema), DisplaySchema])
}
