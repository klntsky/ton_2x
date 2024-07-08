import type { RequestHandler } from 'express'
import type { ParamsDictionary, Query } from 'express-serve-static-core'

export type TRequestHandler<
  TRequestBody = unknown,
  TResponseBody = unknown,
  TRequestQuery = Query,
> = RequestHandler<
ParamsDictionary,
TResponseBody,
TRequestBody,
TRequestQuery,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Record<string, any>
>
