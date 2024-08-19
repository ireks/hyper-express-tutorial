import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
// Inicjalizacja aplikacji Hyper-Express
const app = new express();

// Middleware do parsowania JSON
app.use(bodyParser.json());

const env=process.env;
const serverPort = env.SERVER_PORT!;
const port = env.OPENAPI_SERVER_PORT!;
const title = env.OPENAPI_TITLE!;


const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: title,
      version: '1.0.0',
      description: 'A simple Hyper-Express API',
    },
    servers: [
      {
        url: 'http://localhost:'+serverPort,
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ]
  },
  apis: ['./src/modules/*/infrastructure/http/routes/*.ts'], 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
fs.writeFileSync("./api-doc.json",JSON.stringify(swaggerDocs, null, 2));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// // CRUD Endpoints
// /**
//  * @swagger
//  * /items:
//  *   get:
//  *     summary: Returns a list of items
//  *     responses:
//  *       200:
//  *         description: A successful response
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   id:
//  *                     type: integer
//  *                     example: 1
//  *                   name:
//  *                     type: string
//  *                     example: Item 1
//  */
// app.get('/items', (req, res) => {
//   res.json(items);
// });

// /**
//  * @swagger
//  * /items/{id}:
//  *   get:
//  *     summary: Get an item by ID
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: The item ID
//  *     responses:
//  *       200:
//  *         description: A successful response
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: integer
//  *                   example: 1
//  *                 name:
//  *                   type: string
//  *                   example: Item 1
//  *       404:
//  *         description: Item not found
//  */
// app.get('/items/:id', (req, res) => {
//   const id = parseInt(req.params.id, 10);
//   const item = items.find(i => i.id === id);
//   if (item) {
//     res.json(item);
//   } else {
//     res.status(404).send('Item not found');
//   }
// });

// /**
//  * @swagger
//  * /items:
//  *   post:
//  *     summary: Create a new item
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *                 example: New Item
//  *     responses:
//  *       201:
//  *         description: Item created
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: integer
//  *                   example: 3
//  *                 name:
//  *                   type: string
//  *                   example: New Item
//  */
// app.post('/items', (req, res) => {
//   const newItem = { id: items.length + 1, name: req.body.name };
//   items.push(newItem);
//   res.status(201).json(newItem);
// });

// /**
//  * @swagger
//  * /items/{id}:
//  *   put:
//  *     summary: Update an item by ID
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: The item ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *                 example: Updated Item
//  *     responses:
//  *       200:
//  *         description: Item updated
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: integer
//  *                   example: 1
//  *                 name:
//  *                   type: string
//  *                   example: Updated Item
//  *       404:
//  *         description: Item not found
//  */
// app.put('/items/:id', (req, res) => {
//   const id = parseInt(req.params.id, 10);
//   const item = items.find(i => i.id === id);
//   if (item) {
//     item.name = req.body.name;
//     res.json(item);
//   } else {
//     res.status(404).send('Item not found');
//   }
// });

// /**
//  * @swagger
//  * /items/{id}:
//  *   delete:
//  *     summary: Delete an item by ID
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: The item ID
//  *     responses:
//  *       204:
//  *         description: No content
//  *       404:
//  *         description: Item not found
//  */
// app.delete('/items/:id', (req, res) => {
//   const id = parseInt(req.params.id, 10);
//   const index = items.findIndex(i => i.id === id);
//   if (index !== -1) {
//     items.splice(index, 1);
//     res.status(204).send();
//   } else {
//     res.status(404).send('Item not found');
//   }
// });

// app
//   .listen(port)
//   .then(() => console.log(`Server started on port ${port}`))
//   .catch((err) => console.log(`Failed to start server: ${err.message}`));


  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });