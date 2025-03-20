import express from 'express';
const app = express();

app.use(express.json());

import usersRouter from './routers/usersRouter.js';
app.use(usersRouter);

import swaggerJSDoc from 'swagger-jsdoc';
const swaggerDefinition = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Users API',
      version: '1.0.0',
    }
  },
  apis: ['./routers/*Router.js']
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./routers/*Router.js']
};

import swaggerUi from 'swagger-ui-express';
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(swaggerOptions)));



const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => console.log('Server is running on port', PORT));
