import { ColumnSchema, ColumnSchemaCheck } from 'index'

describe('Column Schema Checker', () => {
  it('check most barebone schema', () => {
    expect(() =>
      ColumnSchemaCheck({
        name: 'barebones',
        type: 'string',
        info: 'just the default string',
        primitive: (api: any) => (api.cell.value == null ? '' : api.cell.value),
      }),
    ).not.toThrow()
  })
  it('check obviously invalid schema', () => {
    expect(() => ColumnSchemaCheck(null)).toThrowError()
    expect(() => ColumnSchemaCheck({})).toThrowError()
    expect(() => ColumnSchemaCheck({ type: '' })).toThrowError()
    expect(() => ColumnSchemaCheck({ type: 'string' })).toThrowError()
    expect(() =>
      ColumnSchemaCheck({ type: 'string.0.0.1', info: 'wawa', display: { type: 'textblabla' } }),
    ).toThrowError()
  })
  it('checks valid schemas', () => {
    expect(() =>
      ColumnSchemaCheck({
        name: 'test column',
        info: 'this column just renders message',
        primitive: (api) => (api.cell.value == null ? '' : api.cell.value),
        display: {
          info: 'shows image',
          config: {},
          render: (api) => ({
            type: 'img',
            value: api.cell.value,
          }),
        },
        config: {
          height: {
            label: 'Height',
            form: (api) => ({ type: 'number', value: api.config.height }),
            type: 'number',
          },
        },

        // parse: {
        //   info: 'regular string parse',
        //   logic: (api, raw: any) => String(raw),
        // },
        filters: {
          '=': {
            form: () => ({ type: 'number' }),
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

        cell: {
          info: 'input is something funky',
          form: {
            render: (api) => ({
              type: 'date',
              value: api.cell.value,
            }),
            parse: () => ({
              value: 'bla',
            }),
          },
          request: {
            read: {
              url: 'http://bla',
              parse: () => ({
                value: 'bla',
              }),
              method: 'get',
              validate: () => true,
            },
          },
        },
      } as ColumnSchema),
    ).not.toThrow()
  })
  it('checks valid schemas', () => {
    expect(() =>
      ColumnSchemaCheck({
        name: 'test column',
        primitive: (api) => (api.cell.value == null ? '' : api.cell.value),
        info: 'this column just renders message',
        type: 'boolean',
        display: {
          info: 'shows image',
          config: {},
          render: () => ({
            type: 'img',
          }),
        },
        config: {
          height: {
            label: 'Height',
            form: (api) => ({ type: 'number', value: api.config.height }),
            type: 'number',
          },
        },

        value: {
          type: 'request',
          info: 'input is something funky',
          read: {
            validate: () => true,
            method: 'get',
            url: 'http://bla',
            config: {},
            headers: () => ({}),
          },
        },
      } as ColumnSchema),
    ).not.toThrow()
  })
})
