
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Express API Documentation",
      version: "1.0.0",
      description: "API docs generated using Swagger for Node.js & Express",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
  },

  // Path to the API docs (use your routes folder)
  apis: ["./routes/*.js"], 
};

export const swaggerSpec = swaggerJSDoc(options);
export const swaggerUiMiddleware = swaggerUi;
