let app;
let initError = null;

try {
  app = require('../Server/app');
} catch (error) {
  initError = error;
  console.error('Fatal initialization error in api/index.js:', error);
}

module.exports = (req, res) => {
  if (initError) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      error: 'Initialization error on Vercel',
      message: initError.message,
      stack: initError.stack
    });
  }
  return app(req, res);
};
