import { DisplayInputSchema } from 'schema/display/input'
import { DisplayStaticSchema } from 'schema/display/static'
import { z } from 'zod'
//TODO: not used yet
const LayoutItem = z.union([DisplayInputSchema, DisplayStaticSchema])
export const LAYOUT_DISPLAY_SCHEMA = [
  z.object({
    type: z.literal('grid'),
    grow: z.boolean().optional(),
    gap: z.number().optional(),
    columns: z.number().optional(),
    // skipping align/justify, maybe it should be at table level
    // align: z.union([z.literal('center'), z.literal('start'), z.literal('end'), z.literal('stretch')]).optional(),
    // justify: z
    //   .union([z.literal('center'), z.literal('start'), z.literal('end'), z.literal('between'), z.literal('around')])
    //   .optional(),
    rows: z.array(
      z.object({
        order: z.number().optional(),
        span: z.union([z.number().optional(), z.literal('auto'), z.literal('content')]),
        offset: z.number().optional(),
        content: LayoutItem,
      }),
    ),
  }),
  z.object({
    type: z.literal('stack'),
    gap: z.number().optional(),
    items: z.array(LayoutItem),
  }),
] as const

export const DisplayLayoutSchema = z.discriminatedUnion('type', [...LAYOUT_DISPLAY_SCHEMA])
export type DisplayLayoutSchema = z.infer<typeof DisplayLayoutSchema>
