export async function timeoutPromise<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout exceeded')), timeoutMs)
    ),
  ]);
}
