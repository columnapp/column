import { makeFunctionWithAPICell } from 'schema/shared'
import { z, ZodType } from 'zod'

function makeEventCallback(extra = z.void()) {
  return makeFunctionWithAPICell(extra, z.any()).optional()
}
export function makeEventsSchema() {
  return z.object({
    /** after the cell is created */
    onCellCreated: makeEventCallback(),
    /** after parse is called, value is set, then this event gets called */
    onCellUpdated: makeEventCallback(),
    /** after the cell is delete, api.value is the last value prior to deletion */
    onCellDeleted: makeEventCallback(),
    /** on config updated */
    onConfigUpdated: makeEventCallback(),
  })
}
export type EventSchemaAny = keyof ReturnType<typeof makeEventsSchema>
