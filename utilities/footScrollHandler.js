// Server-side helper that returns the public path to the client script.
// This lets server templates reference the correct client-side file if desired.

module.exports = {
  publicPath: function() {
    return '/javascripts/footScrollHandler.js';
  }
};
