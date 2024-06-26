export type TDeepTypeInObject<GObjectType, GDeepType> = {
  [K in keyof GObjectType]: GObjectType[K] extends GDeepType
    ? GDeepType
    : GObjectType[K] extends Record<string, unknown>
      ? TDeepTypeInObject<GObjectType[K], GDeepType>
      : never
}
