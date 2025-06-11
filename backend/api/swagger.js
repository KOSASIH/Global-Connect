const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const router = express.Router();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Global-Connect API',
      version: '1.0.0',
    },
  },
  apis: ['./backend/api/*.js'], // Add JSDoc comments in your routes!
};
const specs = swaggerJsdoc(options);

router.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

module.exports = router;
