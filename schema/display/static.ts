import { z } from 'zod'

export const STATIC_SCHEMA_TYPES = [
  z.object({
    type: z.literal('string'),
  }),
  z.object({
    type: z.literal('img'),
    height: z.number().optional(),
  }),
  z.object({
    type: z.literal('loading'),
  }),
] as const

export const DisplayStaticSchema = z.discriminatedUnion('type', [...STATIC_SCHEMA_TYPES])
export type DisplayStaticSchema = z.infer<typeof DisplayStaticSchema>
