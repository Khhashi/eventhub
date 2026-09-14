export default function errorHandler(err, req, res, next) {
  const status = err.status || 500
  const message = err.message || "En intern serverfeil oppstod."

  res.status(status).json({ message })
}