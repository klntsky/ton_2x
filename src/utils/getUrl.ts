export const getUrl = (
  path: string,
  params: Record<string, string | number | boolean | undefined | null>,
) => {
  const urlParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    urlParams.append(key, String(value))
  }

  return `${path}?${urlParams.toString()}`
}
