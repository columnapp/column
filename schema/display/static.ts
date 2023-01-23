import { InputCheckboxFactory } from 'schema/display/input'
import { makeFunctionWithAPICell } from 'schema/shared'
import { z } from 'zod'

export const STATIC_SCHEMA_TYPES = [
  // non input schema
  z.object({
    type: z.literal('string'),
    props: makeFunctionWithAPICell(
      z.object({
        value: z.string().nullable(),
        height: z.number().optional(),
      }),
    ).optional(),
  }),
  z.object({
    type: z.literal('range'),
    props: makeFunctionWithAPICell(
      z.object({
        min: z.number().default(0),
        max: z.number().default(100),
        step: z.number().default(1),
        label: z.string().optional(),
        value: z.number(),
        height: z.number().optional(),
      }),
    ).optional(),
  }),
  InputCheckboxFactory(() => ({})).omit({ parse: true }),
  z.object({
    type: z.literal('sparkline'),
    props: makeFunctionWithAPICell(
      z.object({
        type: z.literal('line').or(z.literal('bar')).default('line'),
        value: z.array(z.number()),
        color: z.string().optional(),
        yaxis: z.tuple([z.number(), z.number()]).optional(),
        labels: z.array(z.string()).optional(),
        height: z.number().optional(),
      }),
    ).optional(),
  }),
  z.object({
    type: z.literal('button'),
    props: makeFunctionWithAPICell(
      z.object({
        label: z.string(),
        round: z.number().optional(),
        color: z.union([z.literal('primary'), z.literal('secondary')]).optional(),
        height: z.number().optional(),
        onClick: z.function().optional(),
      }),
    ).optional(),
  }),
  z.object({
    type: z.literal('tags'),
    props: makeFunctionWithAPICell(
      z.object({
        value: z
          .array(z.string())
          .or(z.array(z.object({ label: z.string(), img: z.string() })))
          .nullable(),
        height: z.number().optional(),
      }),
    ).optional(),
  }),
  z.object({
    type: z.literal('link'),
    props: makeFunctionWithAPICell(
      z.object({
        label: z.string().nullable(),
        value: z.string().nullable(),
        height: z.number().optional(),
      }),
    ),
  }),
  z.object({
    type: z.literal('img'),
    props: makeFunctionWithAPICell(
      z.object({
        value: z.array(z.string()).nullable(),
        round: z.number().optional(),
        height: z.number().optional(),
      }),
    ).optional(),
  }),
] as const

export const DisplayStaticSchema = z.discriminatedUnion('type', [...STATIC_SCHEMA_TYPES])
export type DisplayStaticSchema = z.infer<typeof DisplayStaticSchema>
