const models = require('../db/models');

module.exports = () => {
  return models.sequelize.sync({force: true});
}
