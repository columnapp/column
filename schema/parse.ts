import { makeFunctionWithAPICell, makeFunctionWithAPIColumn } from 'schema/shared'
import { z, ZodType } from 'zod'

export function makeParseValue<Value extends ZodType, Param extends ZodType>(value: Value, param: Param) {
  return makeFunctionWithAPICell(
    z
      .object({
        // value key not defined write undefined or delete, to the cell
        value: value.optional(),
        store: z.any().optional(),
        cache: z.any().optional(),
      })
      .nullable()
      .or(value.nullable()),
    param,
  )
}
export function makeParseValues<Value extends ZodType, Param extends ZodType>(value: Value, param: Param) {
  return makeFunctionWithAPIColumn(
    z
      .object({
        // values array means, just set the list regardless of the current value
        // if it's record, then it's a merge with a defined cuid
        values: z
          .object({
            items: z.union([z.array(value), z.record(value)]),
            // if string, access as property of the values
            // if function, call the function with (value, index), returning the key
            // if not defined, we will insert in order
            key: z.union([z.string(), z.function().args(z.any(), z.string()).returns(z.string())]).optional(),
          })
          .optional(),
        store: z.any().optional(),
        cache: z.any().optional(),
      })
      .nullable(),
    param,
  )
}
