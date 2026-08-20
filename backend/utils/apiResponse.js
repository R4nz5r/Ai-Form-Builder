export function sendSuccess(
  res,
  { statusCode = 200, message = "OK", data = null, meta } = {},
) {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}


