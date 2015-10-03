export default () => {
  const formats = {};

  return (duration, format) => {
    return getFormat(format)(duration);
  };

  function getFormat(format) {
    return (formats[format] = formats[format] || generateFormatFunction(format));
  }

  function generateFormatFunction(format) {
    return duration => {
      return duration;
    };
  }
};