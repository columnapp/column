import { ColumnSchemaCheck, ColumnSchemaString } from 'index'

describe('Column Schema Checker', () => {
  it('check most barebone schema', () => {
    expect(() =>
      ColumnSchemaCheck({
        name: 'barebones',
        version: 'string.0.0.1',
        info: 'just the default string',
      }),
    ).not.toThrow()
  })
  it('check obviously invalid schema', () => {
    expect(() => ColumnSchemaCheck(null)).toThrowError()
    expect(() => ColumnSchemaCheck({})).toThrowError()
    expect(() => ColumnSchemaCheck({ version: '' })).toThrowError()
    expect(() => ColumnSchemaCheck({ version: 'string.0.0.1' })).toThrowError()
    expect(() =>
      ColumnSchemaCheck({ version: 'string.0.0.1', info: 'wawa', display: { type: 'textblabla' } }),
    ).toThrowError()
  })
  it('checks valid schemas', () => {
    expect(() =>
      ColumnSchemaCheck({
        name: 'test column',
        info: 'this column just renders message',
        type: 'string.0.0.1',
        display: {
          info: 'shows image',
          config: {},
          render: {
            type: 'img',
          },
        },
        config: {
          height: {
            label: 'Height',
            form: { type: 'number' },
            type: 'number',
          },
        },
        parse: {
          info: 'regular string parse',
          logic: (_api, raw: any) => String(raw),
        },
        filters: {
          '=': {
            form: { type: 'number' },
            info: 'just straight equal',
            label: 'Equals',
            type: 'number',
            logic() {
              return true
            },
          },
        },
        events: {
          onCellDeleted: () => {},
        },
        value: {
          type: 'cell',
          info: 'input is something funky',
          form: {
            type: 'date',
          },
        },
      } as ColumnSchemaString),
    ).not.toThrow()
  })
})
