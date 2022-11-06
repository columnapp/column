import { makeFunctionWithAPICell } from 'schema/shared'
import { z, ZodType } from 'zod'

function makeEventCallback<V extends ZodType>(valueSchema: V, extra = z.void()) {
  return makeFunctionWithAPICell(valueSchema, extra).optional()
}
export function makeEventsSchema<V extends ZodType>(valueSchema: V) {
  return z.object({
    /** after the cell is created */
    onCellCreated: makeEventCallback(valueSchema),
    /** after parse is called, value is set, then this event gets called */
    onCellUpdated: makeEventCallback(valueSchema),
    /** after the cell is delete, api.value is the last value prior to deletion */
    onCellDeleted: makeEventCallback(valueSchema),
    /** on config updated */
    onConfigUpdated: makeEventCallback(valueSchema),
  })
}
export type EventSchemaAny = keyof ReturnType<typeof makeEventsSchema>
