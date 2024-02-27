import memoize from 'memoizee';

let maxAge = 1800 * 1000;

const memoized = [];

/**
 *
 * @param {Function} fn
 * @param {object} options
 * @return {Function}
 */
export default (fn, options) => {
  const m = memoize(fn, {
    maxAge,
    normalizer: (args) => JSON.stringify(args),
    ...options,
  });
  memoized.push(m);
  return m;
};

export const clearMemoized = () => {
  for (const m of memoized) {
    m.clear();
  }
  return { clear: true };
};
