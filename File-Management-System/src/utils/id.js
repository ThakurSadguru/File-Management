export function createId(prefix = '') {
  const rand = Math.random().toString(16).slice(2)
  const time = Date.now().toString(16)
  return `${prefix}${time}-${rand}`
}

