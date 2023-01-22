import { makeParseValue } from 'schema/parse'
import { makeFunctionWithAPICell } from 'schema/shared'
import { z } from 'zod'

function createInputFactory<T extends string, K extends Record<string, z.ZodSchema> & { value: z.ZodSchema }>(
  type: T,
  props: K,
) {
  function factory<R extends Record<string, z.ZodSchema>>(extend: (value: K['value']) => R) {
    return z.object({
      /** type of input the render */
      type: z.literal(type),
      error: z.string().optional().nullable(),
      props: makeFunctionWithAPICell(
        z.object({ ...props, value: props.value.nullable() }),
        props.value.nullable(),
      ).optional(),
      parse: makeParseValue(props.value, props.value.nullable()).optional(),
      ...extend(props.value),
    })
  }
  return factory
}

export const InputTextFactory = createInputFactory('text', {
  value: z.string(),
  minlength: z.number().optional(),
  maxlength: z.number().optional(),
})
export const InputMonthFactory = createInputFactory('month', { value: z.date() })
export const InputTimeFactory = createInputFactory('time', { value: z.date() })
export const InputNumberFactory = createInputFactory('number', { step: z.number().optional(), value: z.number() })
export const InputDateFactory = createInputFactory('date', { value: z.date() })
export const InputSelectFactory = createInputFactory('select', {
  multiple: z.boolean().default(false).optional(),
  value: z.string().or(z.array(z.string())),
  options: z.array(z.object({ value: z.any(), label: z.string().optional() })),
})
export const InputWeekFactory = createInputFactory('week', { value: z.date() })
export const InputCheckboxFactory = createInputFactory('checkbox', { value: z.boolean().optional() })

// text, month, number, date, checkbox, select

//standard ---------------------------------------------:
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-list

export const InputColorFactory = createInputFactory('color', { value: z.string() })
export const InputRangeFactory = createInputFactory('range', {
  min: z.number(),
  max: z.number(),
  step: z.number().default(1).optional(),
  value: z.number(),
})

const InputColumnFactory = createInputFactory('column', {
  value: z.string(),
})
export const InputColumn = InputColumnFactory(() => ({})).omit({ parse: true, props: true, error: true })

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
