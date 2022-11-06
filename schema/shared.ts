import { makeCellAPISchema, makeColumnAPISchema } from 'schema/api'
import { z, ZodTuple, ZodType } from 'zod'

export function makeFunctionWithAPICell<
  V extends ZodType,
  R extends ZodType,
  Items extends Parameters<typeof ZodTuple['create']>[0],
>(valueSchema: V, returns: R, ...args: Items) {
  return z
    .function()
    .args(
      /** maybe this will workd */
      makeCellAPISchema(valueSchema),
      ...args,
    )
    .returns(returns)
    .describe('API of a cell')
}

export function makeFunctionWithAPIColumn<
  V extends ZodType,
  R extends ZodType,
  Items extends Parameters<typeof ZodTuple['create']>[0],
>(value: V, returns: R, ...args: Items) {
  return z
    .function()
    .args(makeColumnAPISchema(value), ...args)
    .returns(returns)
}

/**
 * adds info + config
 * @param obj
 * @returns
 */
export function makeExtensibleSchema() {
  return z.object({
    /** describe what it does, supports markdown. */
    info: z.string(),
    /**
     * defines which config from the column level config definition that this functionality has access to.
     * For example, given config definition of:
     * {
     *  lengthText: {
     *      label: 'Length of Text',
     *      form: {type: 'number'}
     *   }
     * }
     * then to access this config here, the value of the config:
     * config: { lengthText: true}
     * after defining the config properties to access, then api.config.lengthText is available
     * */
    config: z.record(z.any()).optional(),
  })
}
