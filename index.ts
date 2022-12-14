export type { CellAPISchemaAny, ColumnAPISchemaAny } from 'schema/api'
export type { DisplaySchema } from 'schema/display'
export { DisplayInputSchema, DisplayConfigSchema as DisplayCellSchema } from 'schema/display/input'
export { DisplayStaticSchema } from 'schema/display/static'
import { DisplaySchema } from 'schema/display'
import { DisplayInputSchema } from 'schema/display/input'
import { DisplayStaticSchema } from 'schema/display/static'
import { makeEventsSchema } from 'schema/events'
import { makeConfigSchema, makeFilterSchema } from 'schema/option'
import { makeFunctionWithAPICell, makeExtensibleSchema, makeFunctionWithAPIColumn } from 'schema/shared'
import { z, ZodError, ZodIssue, ZodType } from 'zod'
import { fromZodError } from 'zod-validation-error'

function makeColumnV0_0_1<V extends ZodType>(cellValueSchema: V) {
  const extensibleSchema = makeExtensibleSchema({})
  // add parameter to the function because, the underlying api.cell.value is not the same as form input
  const form = makeFunctionWithAPICell(cellValueSchema, DisplayInputSchema.or(DisplayStaticSchema), z.any())
  const recordCreator = makeFunctionWithAPICell(cellValueSchema, z.record(z.any()), z.any())
  const CellRequestObject = z.object({
    // TODO: poll is not implemented yet
    url: z.union([makeFunctionWithAPICell(cellValueSchema, z.string()), z.string()]),
    /** request will only fire if validate() returns true */
    validate: makeFunctionWithAPICell(cellValueSchema, z.boolean(), z.any()),
    method: z.union([z.literal('post'), z.literal('get'), z.literal('put')]),
    params: recordCreator.optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
    headers: recordCreator.optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
  })
  return z.object({
    /** name of the column */
    name: z.string({
      description: 'name of the column',
    }),
    /** information of the column, describe what this column does. Supports markdown. */
    info: z.string(),
    /** dictates how the column displays the data in cells */
    display: z
      .object({
        /** the logic on how the cell renders data */
        render: makeFunctionWithAPICell(cellValueSchema, DisplaySchema),
      })
      .and(extensibleSchema)
      .optional(),
    /**
     * parse will be called prior to commiting the value, for ex: after user inputs from the cell or
     * during import, the raw value will be passed to parse and the resulting value will be the result
     */
    parse: z
      .object({
        /**
         * logic to parse, the first parameter is the api and the second is the raw value to be parsed
         */
        logic: makeFunctionWithAPICell(cellValueSchema, cellValueSchema.optional().nullable(), z.any()),
      })
      .and(extensibleSchema)
      .optional(),
    /**
     * filtering capability of the column, the property of this object will be used as filter autocomplete token.
     * For example, { "=": {logic: (api, cellvalue) => api.value === cellvalue }}
     */
    filters: z.record(extensibleSchema.and(makeFilterSchema(cellValueSchema))).optional(),
    /**
     * exposes the underlying data to be read by other columns
     * defaults, there will always be "api.cell.value" exposure as value
     */
    expose: z
      .record(
        z
          .object({
            label: z.string().optional(),
            /** returns the value */
            returns: makeFunctionWithAPICell(cellValueSchema, z.any()),
          })
          .and(extensibleSchema),
      )
      .optional(),
    /** callback for various events */
    events: makeEventsSchema(cellValueSchema).optional(),
    /**
     * allows end user to configure the column. Each of the config defined here will be accessible in various parts of the column.
     * Example: define config:
     *  {
     *    uppercase: {type: 'boolean', form: {type: 'checkbox}}
     *  }
     * and in display: {config: {uppercase: true}}
     * inside of display.render(api), the api will have access to api.config.uppercase
     */
    config: z.record(makeConfigSchema(cellValueSchema)).optional(),
    /** defines the source of the value, such as cell (user manually enter through the table) and more */
    value: z
      .discriminatedUnion('type', [
        /** takes value from the user then pass the result parse() */
        z.object({
          type: z.literal('cell'),
          form: form,
        }),
        /** request url then pass the result to parse() */
        z.object({
          type: z.literal('request'),
          read: CellRequestObject.optional(),
          write: CellRequestObject.and(z.object({ form })).optional(),
        }),
      ])
      .and(extensibleSchema)
      .optional(),
  })
}

export const ColumnSchema = makeColumnV0_0_1(z.any())

export type ColumnSchema = z.infer<typeof ColumnSchema>

export class ColumnSchemaError extends Error {
  constructor(public issues: Array<ZodIssue>, public readable: any) {
    super()
  }
}

export function ColumnSchemaCheck(obj: unknown) {
  try {
    return ColumnSchema.parse(obj)
  } catch (err: any) {
    if (err instanceof ZodError) {
      const schemaError = new ColumnSchemaError(err.issues, fromZodError(err))
      throw schemaError
    }
  }
}
