import { z } from 'zod'

function createInputSchema<T extends string, K extends Record<string, z.ZodSchema>>(type: T, props: K) {
  return z.object({
    /** type of input the render */
    type: z.literal(type),
    /** error message */
    error: z.string().optional().nullable(),
    /** value of the input,  if defined statically, it will be automatically injected with api.value, ex:
     * display: render: {type: 'text'} will automatically have value as api.value
     */
    value: z.any().optional(),
    ...props,
  })
}
export const FILTER_INPUT_TYPES = [
  createInputSchema('text', { minlength: z.number().optional(), maxlength: z.number().optional() }),
  createInputSchema('month', {}),
  createInputSchema('time', {}),
  createInputSchema('number', { step: z.string().optional() }),
  createInputSchema('date', {}),
  createInputSchema('select', {
    multiple: z.boolean().default(false).optional(),
    options: z.array(z.object({ value: z.any(), label: z.string().optional() })),
  }),
  createInputSchema('week', {}),
  createInputSchema('checkbox', { value: z.boolean().optional() }),
] as const
// text, month, number, date, checkbox, select

export const CONFIG_INPUT_TYPES = [
  //standard ---------------------------------------------:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-list

  createInputSchema('color', {}),
  createInputSchema('button', { label: z.string() }),
  createInputSchema('range', { min: z.number(), max: z.number(), step: z.number().default(1).optional() }),
  // non standard ----------------------------------------
  createInputSchema('column', {}),

  // based off of imask ------------------------------------
  // createInputSchema('mask-regex', { regex: z.string() }),
  // createInputSchema('mask-number', {
  //   scale: z.number().default(0),
  //   signed: z.boolean().default(true),
  //   separator: z.string().default(','), // separator
  //   radix: z.string().default('.'),
  // }), // fractional separator
  // createInputSchema('mask-pattern', {
  //   /**
  //       0 - any digit
  //       a - any letter
  //       * - any char
  //       other chars which is not in custom definitions supposed to be fixed
  //       [] - make input optional
  //       {} - include fixed part in unmasked value
  //       ` - prevent symbols shift back
  //   */
  //   pattern: z.string(),
  // }),
] as const
export const DisplayFilterSchema = z.discriminatedUnion('type', [...FILTER_INPUT_TYPES])
export type DisplayFilterSchema = z.infer<typeof DisplayFilterSchema>
export const DisplayConfigSchema = z.discriminatedUnion('type', [...CONFIG_INPUT_TYPES])
export type DisplayConfigSchema = z.infer<typeof DisplayConfigSchema>

export const DisplayInputSchema = z.union([DisplayFilterSchema, DisplayConfigSchema])
export type DisplayInputSchema = z.infer<typeof DisplayInputSchema>
