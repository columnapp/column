import { z, ZodType } from 'zod'
function makeCellValueAPI<V extends ZodType>(valueSchema: V) {
  return z.object({
    value: valueSchema,
    created: z.number(),
    updated: z.number(),
  })
}
export function makeCellAPISchema<V extends ZodType>(valueSchema: V) {
  const rawCell = makeCellValueAPI(valueSchema)
  return z.object({
    /** the value of the cell */
    cell: rawCell,
    /** the values of the column, keyed by cell id, includes self */
    cells: z.record(rawCell.nullable()),
    /** config values, only config defined by the config object will be accessible here */
    config: z.record(z.any()),
    /**
     * memory caching, data set here won't be preserved on refresh. for ex: api.cache.visited = true
     * cache has column level scope, meaning, the object is shared among all cells of the column.
     */
    cache: z.record(z.any()), // cache in-memory
    /**
     * stored data, data set here will be preserved, ex: api.store.visited = true
     * store has column level scope, meaning, the object is shared among all cells of the column.
     */
    store: z.record(z.any()),
    /** cell id */
    id: z.string(),
    /**
     * interface to access data of another column in the same row. ex: api.column[columnid].value
     * in order to get the column id, user can be prompted through config, ex:
     * config: {otherColumn: {form: {type: 'column'}}}
     * and then it can be accessed: api.column[api.config.otherColumn].value
     */
    columns: z.record(rawCell),
  })
}
export function makeColumnAPISchema<V extends ZodType>(valueSchema: V) {
  return makeCellAPISchema(valueSchema).omit({ value: true, columns: true })
}
export type CellAPISchemaAny = z.infer<ReturnType<typeof makeCellAPISchema>>
export type ColumnAPISchemaAny = z.infer<ReturnType<typeof makeColumnAPISchema>>
