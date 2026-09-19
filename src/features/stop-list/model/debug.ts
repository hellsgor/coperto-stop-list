export function isDebugFail(
  value: string | string[] | null | undefined,
): boolean {
  return (Array.isArray(value) ? value[0] : value) === 'fail';
}
