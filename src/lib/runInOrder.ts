/** Run tasks one after another. A rejection skips every later task. */
export async function runInOrder<T>(
  items: readonly T[],
  task: (item: T) => Promise<unknown>
): Promise<void> {
  await items.reduce<Promise<void>>(
    (previous, item) => previous.then(() => task(item).then(() => undefined)),
    Promise.resolve()
  );
}
