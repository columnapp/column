export type { CellAPISchemaAny, ColumnAPISchemaAny } from 'schema/api'
export type { DisplaySchema } from 'schema/display'
export { DisplayInputSchema, DisplayConfigSchema as DisplayCellSchema } from 'schema/display/input'
export { DisplayStaticSchema } from 'schema/display/static'
import { CellAPISchemaAny, ColumnAPISchemaAny } from 'schema/api'
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

  const recordCreator = z.union([
    makeFunctionWithAPICell(cellValueSchema, z.record(z.any()), z.any()),
    z.record(z.any()),
  ])

  /**
   * parse will be called prior to commiting the value, for ex: after user inputs from the cell or
   * during import, the raw value will be passed to parse and the resulting value will be the result
   * if save is not defined, then value wont be persisted in the database, for example, in a computed
   * column.
   */
  const parseValue = makeFunctionWithAPICell(
    cellValueSchema,
    z
      .object({
        // value key not defined write undefined or delete, to the cell
        value: z.any().optional(),
        store: z.any().optional(),
        cache: z.any().optional(),
      })
      .nullable(),
    z.any(),
  )
  const parseValues = makeFunctionWithAPICell(
    cellValueSchema,
    z
      .object({
        // values array means, just set the list regardless of the current value
        // if it's record, then it's a merge with a defined cuid
        values: z
          .object({
            items: z.union([z.array(z.any()), z.record(z.any())]),
            // if string, access as property of the values
            // if function, call the function with (index, value), like Object.entries, returning the key
            // the resulting key value needs to be consistent to make sure the right row is updated
            // default value is "id"
            key: z.union([z.string(), z.function().args(z.any(), z.string()).returns(z.string())]).optional(),
          })
          .optional(),
        store: z.any().optional(),
        cache: z.any().optional(),
      })
      .nullable(),
    z.any(),
  )

  const CellRequestObject = {
    // TODO: poll is not implemented yet
    url: z.union([makeFunctionWithAPICell(cellValueSchema, z.string()), z.string()]),
    /** request will only fire if validate() returns true */
    validate: makeFunctionWithAPICell(cellValueSchema, z.boolean(), z.any()),
    method: z.union([z.literal('post'), z.literal('get'), z.literal('put')]),
    params: recordCreator.optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
    headers: recordCreator.optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
    parse: parseValue,
  } as const
  const ColumnRequestObject: { [K in keyof typeof CellRequestObject]: any } = {
    url: z.union([makeFunctionWithAPIColumn(cellValueSchema, z.string()), z.string()]),
    validate: makeFunctionWithAPIColumn(cellValueSchema, z.boolean(), z.any()),
    method: z.union([z.literal('post'), z.literal('get'), z.literal('put')]),
    params: recordCreator.optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
    headers: recordCreator.optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
    parse: parseValues,
  }
  return z.object({
    /** name of the column */
    name: z.string({
      description: 'name of the column',
    }),
    /** information of the column, describe what this column does. Supports markdown. */
    info: z.string(),
    /** primitive data type representation of the value, used for sorting, grouping, etc */
    primitive: makeFunctionWithAPICell(
      cellValueSchema,
      z.union([z.number(), z.null(), z.string(), z.boolean(), z.undefined(), z.bigint()]),
    ),
    /** dictates how the column displays the data in cells */
    display: z
      .object({
        /** the logic on how the cell renders data */
        render: makeFunctionWithAPICell(cellValueSchema, DisplaySchema),
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
     * by default, there will always be "Value" exposed, which returns valueOf
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
    cell: z
      .object({
        // read request will always be watched
        // if there is parse() then it will be saved in db

        // result shows on display()
        // click cell
        // if defined show form
        // enter value
        // parse(form)
        form: z
          .object({
            render: makeFunctionWithAPICell(cellValueSchema, DisplayInputSchema.or(DisplayStaticSchema), z.any()),
            parse: parseValue,
          })
          .optional(), // shows form on edit
        // request.hash will be watched, changes will send a request
        // with the new parameters
        request: z
          .object({
            read: z.object(CellRequestObject).optional(),
            // after parse -> commit, will optionally send a POST to write
            write: z
              .object(
                CellRequestObject, // result of the response
              )
              .optional(),
            // syncs whole column values
            list: z.object(ColumnRequestObject).optional(),
          })
          .optional(),
      })
      .and(extensibleSchema)
      .optional(),
  })
}

export const ColumnSchema = makeColumnV0_0_1(z.any())

export type ColumnSchema = z.infer<typeof ColumnSchema>
export type CellAPI = CellAPISchemaAny
export type ColumnAPI = ColumnAPISchemaAny

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
