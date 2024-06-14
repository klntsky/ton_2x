export type TDeepTypeInObject<GObjectType, GDeepType> = {
  [K in keyof GObjectType]: GObjectType[K] extends (...args: any[]) => any
    ? GObjectType[K]
    : GObjectType[K] extends Record<string, any>
      ? TDeepTypeInObject<GObjectType[K], GDeepType>
      : GDeepType;
}
