export type { CellAPISchemaAny, ColumnAPISchemaAny } from 'schema/api'
export type { DisplaySchema } from 'schema/display'
export { DisplayConfigSchema as DisplayCellSchema, DisplayInputSchema } from 'schema/display/input'
export { DisplayStaticSchema } from 'schema/display/static'
import { CellAPISchemaAny, ColumnAPISchemaAny } from 'schema/api'
import { DisplayConfigSchema, DisplayFilterSchema, DisplayInputSchema } from 'schema/display/input'
import { DisplayStaticSchema } from 'schema/display/static'
import { makeEventsSchema } from 'schema/events'
import { makeParseValue, makeParseValues } from 'schema/parse'
import { makeFunctionWithAPICell, makeFunctionWithAPIColumn } from 'schema/shared'
import { z, ZodError, ZodIssue } from 'zod'
import { fromZodError } from 'zod-validation-error'

function makeColumnV0_0_1() {
  const extensibleSchema = z.object({
    info: z.string(),
  })
  // add parameter to the function because, the underlying api.cell.value is not the same as form input

  const recordCreatorCell = z.union([makeFunctionWithAPICell(z.record(z.any()), z.any()), z.record(z.any())])
  const recordCreatorColumn = z.union([makeFunctionWithAPIColumn(z.record(z.any()), z.any()), z.record(z.any())])
  /**
   * parse will be called prior to commiting the value, for ex: after user inputs from the cell or
   * during import, the raw value will be passed to parse and the resulting value will be the result
   * if save is not defined, then value wont be persisted in the database, for example, in a computed
   * column.
   */
  const parseValue = makeParseValue(z.any(), z.any())
  const parseValues = makeParseValues(z.any(), z.any())

  const url = z.union([makeFunctionWithAPICell(z.string()), z.string()])
  const method = z.union([z.literal('post'), z.literal('get'), z.literal('put'), z.literal('patch')])
  const type = z.union([z.literal('json'), z.literal('form')]).optional()

  const CellRequestObject = {
    // TODO: poll is not implemented yet
    url,
    method,
    type,
    /** request will only fire if validate() returns true */
    validate: makeFunctionWithAPICell(z.boolean()),
    query: recordCreatorCell.optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
    body: recordCreatorCell.optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
    headers: recordCreatorCell.optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
  } as const
  const ColumnRequestObject = {
    url,
    method,
    type,
    validate: makeFunctionWithAPIColumn(z.boolean()),
    query: recordCreatorColumn.optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
    body: recordCreatorColumn.optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
    headers: recordCreatorColumn.optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
  } as const
  const refetchCellRequestObject = z
    .object({ ...CellRequestObject, every: z.number() })
    .partial()
    .optional()
  const refetchColumnRequestObject = z
    .object({ ...ColumnRequestObject, every: z.number() })
    .partial()
    .optional()

  return z.object({
    /** name of the column */
    name: z.string({
      description: 'name of the column',
    }),
    /** information of the column, describe what this column does. Supports markdown. */
    info: z.string(),
    /** primitive data type representation of the value, used for sorting, grouping, etc */
    primitive: makeFunctionWithAPICell(
      z.union([z.number(), z.null(), z.string(), z.boolean(), z.undefined(), z.bigint()]),
    ),
    /** dictates how the column displays the data in cells */
    display: DisplayStaticSchema.and(extensibleSchema).optional(),

    /**
     * filtering capability of the column, the property of this object will be used as filter autocomplete token.
     * For example, { "=": {logic: (api, cellvalue) => api.value === cellvalue }}
     */
    filters: z.record(extensibleSchema.and(DisplayFilterSchema)).optional(),
    /**
     * exposes the underlying data to be read by other columns
     * by default, there will always be "Value" exposed, which returns valueOf
     */
    expose: z
      .record(
        z
          .object({
            label: z.string().optional(),
            /** returns the value */
            returns: makeFunctionWithAPICell(z.any()),
          })
          .and(extensibleSchema),
      )
      .optional(),
    /** callback for various events */
    events: makeEventsSchema().optional(),
    /**
     * allows end user to configure the column. Each of the config defined here will be accessible in various parts of the column.
     * Example: define config:
     *  {
     *    uppercase: {type: 'boolean', form: {type: 'checkbox}}
     *  }
     * and in display: {config: {uppercase: true}}
     * inside of display.render(api), the api will have access to api.config.uppercase
     */
    config: z.record(DisplayFilterSchema.or(DisplayConfigSchema)).optional(),
    /** defines the source of the value, such as cell (user manually enter through the table) and more */
    column: z
      .object({
        list: z.object({ ...ColumnRequestObject, parse: parseValues, refetch: refetchColumnRequestObject }).optional(),
      })
      .optional(),
    cell: z
      .object({
        // read request will always be watched
        // if there is parse() then it will be saved in db

        // result shows on display()
        // click cell
        // if defined show form
        // enter value
        // parse(form)
        form: DisplayInputSchema.optional(), // shows form on edit
        // request.hash will be watc-hed, changes will send a request
        // with the new parameters
        request: z
          .object({
            read: z.object({ ...CellRequestObject, parse: parseValue, refetch: refetchCellRequestObject }).optional(),
            // after parse -> commit, will optionally send a POST to write
            write: z.object({ ...CellRequestObject, parse: parseValue }).optional(),
            // syncs whole column values
          })
          .optional(),
      })
      .and(extensibleSchema)
      .optional(),
  })
}

export const ColumnSchema = makeColumnV0_0_1()

export type ColumnSchema = z.infer<typeof ColumnSchema>

export type CellAPI = CellAPISchemaAny
export type ColumnAPI = ColumnAPISchemaAny

export class ColumnSchemaError extends Error {
  constructor(public issues: Array<ZodIssue>, public readable: any) {
    super()
  }
  toString() {
    return this.readable
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
