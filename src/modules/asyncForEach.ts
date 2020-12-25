export async function asyncForEach(
  array:
    | {
        tag?: string;
        filename?: string;
        path?: string;
        src?: string;
        cid?: string;
      }[]
    | string
    | string[],
  callback: any
) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
