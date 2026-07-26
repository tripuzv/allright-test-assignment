export const formatHelper = {
  json: {
    stringify(args: {
      value: string | number | boolean | object;
      replacer?: (this: any, key: string, value: any) => any;
      space?: string | number;
    }): string {
      const { value, replacer = null, space = 2 } = args;
      return JSON.stringify(value, replacer, space);
    },
  },
  string: {
    removeLast(source: string, charToRemove: string): string {
      if (source.length > 0 && source[source.length - 1] === charToRemove) {
        return source.slice(0, -1);
      }
      return source;
    },
  },
};
