// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Server error' 
      : err.message
  });
};