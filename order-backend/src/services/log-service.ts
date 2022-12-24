export function debug(...params: any[]) {
  console.debug(...params);
}

export function info(...params: any[]) {
  console.info(...params);
}

export function error(...params: any[]) {
  console.error(...params);
}

export function warn(...params: any[]) {
  console.warn(...params);
}

export default {
  debug,
  info,
  warn,
  error,
};
