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
  it('checks valid schemas 1', () => {
    expect(() =>
      ColumnSchemaCheck({
        name: 'test column',
        info: 'this column just renders message',
        primitive: (api) => (api.cell.value == null ? '' : api.cell.value),
        display: {
          info: 'shows image',
          type: 'string',
          props(api) {
            return { text: api.cell.value }
          },
        },
        config: {
          height: {
            // label: 'Height',
            // form: (api) => ({ type: 'number', value: api.config.height }),
            // type: 'number',
            type: 'number',
            parse: (api, raw: any) => Number(raw),
            props: (api, value) => ({ value }),
          },
        },

        filters: {
          '=': {
            type: 'number',
            info: 'equal to',
            parse: (api, raw: any) => Number(raw),
            props: (api, value) => ({
              step: 0.1,
              value: 1,
            }),
          },
        },
        events: {
          onCellDeleted: () => {},
        },
        cell: {
          info: 'input is something funky',
          form: {
            type: 'date',
            parse: (value) => ({
              value,
            }),
            props: (api, value) => ({ value }),
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
            list: {
              url: 'http://bla',
              parse: () => ({
                values: {
                  items: [],
                },
              }),
              method: 'get',
              validate: () => true,
              refetch: {
                every: 2000,
              },
            },
          },
        },
      } as ColumnSchema),
    ).not.toThrow()
  })
  it('checks valid schemas 2', () => {
    expect(() =>
      ColumnSchemaCheck({
        name: 'test column',
        primitive: (api) => (api.cell.value == null ? '' : api.cell.value),
        info: 'this column just renders message',
        type: 'boolean',
        display: {
          info: 'shows image',
          type: 'img',
          props: (api) => {
            return {
              src: api.cell.value,
            }
          },
        },
        config: {
          height: {
            label: 'Height',
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
