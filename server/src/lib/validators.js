/**
 * Validation helpers for MongoDB ObjectIds
 */

/**
 * Validates if a string is a valid MongoDB ObjectId format
 * MongoDB ObjectIds are 24-character hex strings
 * @param {string} id - The string to validate
 * @returns {boolean}
 */
function isValidObjectId(id) {
  if (typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Express middleware to validate ObjectId params
 * @param {string} paramName - The name of the param to validate
 */
function validateObjectId(paramName) {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !isValidObjectId(id)) {
      return res.status(400).json({ 
        error: `Invalid ${paramName} format. Expected 24-character hex string.` 
      });
    }
    next();
  };
}

module.exports = {
  isValidObjectId,
  validateObjectId
};
