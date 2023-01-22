import { makeCellAPISchema, makeColumnAPISchema } from 'schema/api'
import { z, ZodRawShape, ZodTuple, ZodType } from 'zod'

export function makeFunctionWithAPICell<
  Returns extends ZodType,
  Items extends Parameters<typeof ZodTuple['create']>[0],
>(returns: Returns, ...args: Items) {
  return z
    .function()
    .args(makeCellAPISchema(z.any()), ...args)
    .returns(returns)
}

export function makeFunctionWithAPIColumn<R extends ZodType, Items extends Parameters<typeof ZodTuple['create']>[0]>(
  returns: R,
  ...args: Items
) {
  return z
    .function()
    .args(makeColumnAPISchema(z.any()), ...args)
    .returns(returns)
}
