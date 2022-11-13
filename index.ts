export type { CellAPISchemaAny, ColumnAPISchemaAny } from 'schema/api'
export type { DisplaySchema } from 'schema/display'
import { DisplaySchema } from 'schema/display'
import { DisplayInputSchema } from 'schema/display/input'
import { makeEventsSchema } from 'schema/events'
import { makeConfigSchema, makeFilterSchema } from 'schema/option'
import { makeFunctionWithAPICell, makeExtensibleSchema } from 'schema/shared'
import { z, ZodError, ZodIssue, ZodType } from 'zod'
import { fromZodError } from 'zod-validation-error'
function makeColumnV0_0_1<V extends ZodType, T extends string>(cellValueSchema: V, versionSchema: T) {
  return z.object({
    /** name of the column */
    name: z.string(),
    /** what version of the column, dictates what value this column will hold, ex: date.0.0.1 or date[].0.0.1 */
    version: z.literal(versionSchema),
    /** information of the column, describe what this column does. Supports markdown. */
    info: z.string(),
    /** dictates how the column displays the data in cells */
    display: makeExtensibleSchema({
      /** the logic on how the cell renders data */
      render: makeFunctionWithAPICell(cellValueSchema, DisplaySchema).or(DisplaySchema),
    }).optional(),
    /**
     * parse will be called prior to commiting the value, for ex: after user inputs from the cell or
     * during import, the raw value will be passed to parse and the resulting value will be the result
     */
    parse: makeExtensibleSchema({
      /**
       * logic to parse, the first parameter is the api and the second is the raw value to be parsed
       */
      logic: makeFunctionWithAPICell(cellValueSchema, cellValueSchema.optional().nullable(), z.unknown()),
    }).optional(),
    /**
     * filtering capability of the column, the property of this object will be used as filter autocomplete token.
     * For example, { "=": {logic: (api, cellvalue) => api.value === cellvalue }}
     */
    filters: z.record(makeExtensibleSchema({}).and(makeFilterSchema(cellValueSchema))).optional(),
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
      .union([
        z.object({
          type: z.literal('cell'), // takes value from cell
          form: z.union([makeFunctionWithAPICell(cellValueSchema, DisplayInputSchema), DisplayInputSchema]).optional(),
        }),
        z.object({
          type: z.literal('url'),
          method: z.union([z.literal('post'), z.literal('get')]),
          params: z.record(z.string()).optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
          headers: z.record(z.string()).optional(), // can refer to other columns, for use case of SKU in one column -> price column by SKU
        }),
      ])
      .and(makeExtensibleSchema({}))
      .optional(),
  })
}

// list all native column types, include it in column type in column/index.ts
const ColumnSchemaNumber0_0_1 = makeColumnV0_0_1(z.number(), 'number.0.0.1')
export type ColumnSchemaNumber = z.infer<typeof ColumnSchemaNumber0_0_1>

const ColumnSchemaString0_0_1 = makeColumnV0_0_1(z.string(), 'string.0.0.1')
export type ColumnSchemaString = z.infer<typeof ColumnSchemaString0_0_1>

const ColumnSchemaDate0_0_1 = makeColumnV0_0_1(z.date(), 'date.0.0.1')
export type ColumnSchemaDate = z.infer<typeof ColumnSchemaDate0_0_1>

const ColumnSchemaBoolean0_0_1 = makeColumnV0_0_1(z.boolean(), 'boolean.0.0.1')
export type ColumnSchemaBoolean = z.infer<typeof ColumnSchemaBoolean0_0_1>

const ColumnSchemaNumbers0_0_1 = makeColumnV0_0_1(z.array(z.number()), 'number[].0.0.1')
export type ColumnSchemaNumbers = z.infer<typeof ColumnSchemaNumbers0_0_1>

const ColumnSchemaStrings0_0_1 = makeColumnV0_0_1(z.array(z.string()), 'string[].0.0.1')
export type ColumnSchemaStrings = z.infer<typeof ColumnSchemaStrings0_0_1>

const ColumnSchemaDates0_0_1 = makeColumnV0_0_1(z.array(z.date()), 'date[].0.0.1')
export type ColumnSchemaDates = z.infer<typeof ColumnSchemaDates0_0_1>

const ColumnSchemaBooleans0_0_1 = makeColumnV0_0_1(z.array(z.boolean()), 'boolean[].0.0.1')
export type ColumnSchemaBooleans = z.infer<typeof ColumnSchemaBooleans0_0_1>

export type ColumnSchema =
  | ColumnSchemaNumber
  | ColumnSchemaString
  | ColumnSchemaDate
  | ColumnSchemaBoolean
  | ColumnSchemaNumbers
  | ColumnSchemaStrings
  | ColumnSchemaDates
  | ColumnSchemaBooleans

const ColumnSchema: z.ZodType<ColumnSchema> = z.lazy(() =>
  z.discriminatedUnion('version', [
    ColumnSchemaBoolean0_0_1,
    ColumnSchemaBooleans0_0_1,
    ColumnSchemaDate0_0_1,
    ColumnSchemaDates0_0_1,
    ColumnSchemaNumber0_0_1,
    ColumnSchemaNumbers0_0_1,
    ColumnSchemaString0_0_1,
    ColumnSchemaStrings0_0_1,
  ]),
)

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
