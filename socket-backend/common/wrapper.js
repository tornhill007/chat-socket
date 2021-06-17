function catchWrap(originalFunction) {
  return async function (req, res, next) {
    try {
      await originalFunction.call(this, req, res);
    } catch (e) {
      res.status(401).json({
        message: e.message
      })
      // next(e);
    }
  };
}

module.exports = catchWrap;