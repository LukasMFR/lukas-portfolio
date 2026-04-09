(function () {
  const englishData = window.PORTFOLIO_DATA_EN || {};
  const frenchData = window.PORTFOLIO_DATA_FR || {};

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function clone(value) {
    if (Array.isArray(value)) {
      return value.map(clone);
    }

    if (isPlainObject(value)) {
      const result = {};

      Object.keys(value).forEach((key) => {
        result[key] = clone(value[key]);
      });

      return result;
    }

    return value;
  }

  function mergeValues(left, right) {
    if (Array.isArray(left) && Array.isArray(right)) {
      const length = Math.max(left.length, right.length);

      return Array.from({ length }, (_, index) => mergeValues(left[index], right[index]));
    }

    if (isPlainObject(left) && isPlainObject(right)) {
      const result = {};
      const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

      keys.forEach((key) => {
        result[key] = mergeValues(left[key], right[key]);
      });

      return result;
    }

    if (left === undefined) return clone(right);
    if (right === undefined) return clone(left);

    return clone(left);
  }

  window.PORTFOLIO_DATA = mergeValues(englishData, frenchData);
})();
