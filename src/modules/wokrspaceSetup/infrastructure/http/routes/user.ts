import { Router } from "hyper-express";
import logger from "../../../../../shared/logger";
import {
  CreateUserCommand,
  LoginUserCommand,
} from "../../../application/commands/Commands";
import ValidationError from "../../../../../shared/Errors/ValidationError";
import authMiddleware from "../../../../../shared/authMiddleware";
const userRouter = new Router();
/**
 * @swagger
 * /user/test-secure:
 *   post:
 *     summary: Test secure route
 *     description: This endpoint is protected and requires both a valid JWT token in the Authorization header.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User has the right to access this route.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "user has right"
 *       401:
 *         description: Unauthorized access due to missing, invalid, or expired token, or incorrect password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */
userRouter.post("/test-secure", authMiddleware, async (req, res) => {
  res.status(201).json("user has right");
});

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user with their username, password, and realmName.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: user123
 *               password:
 *                 type: string
 *                 example: password123
 *               realmName:
 *                 type: string
 *                 example: exampleRealm
 *     responses:
 *       201:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
 */

userRouter.post("/login", async (req, res) => {
  try {
    const data = await req.json();
    const app = req.locals.app;

    console.log(data);
    logger.info(data);

    const tokens = await app
      .getCommandBus()
      .execute(
        new LoginUserCommand(data.username, data.password, data.realmName)
      );

    logger.info(tokens);
    res.status(201).json(tokens);
  } catch (err: any) {
    logger.error(err.message);
    if (err instanceof ValidationError) {
      res.status(400).json({ message: err.errors });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

/**
 * @swagger
 * paths:
 *  /user:
 *    post:
 *      summary: Create a new user
 *      description: Endpoint to create a new user.
 *      tags:
 *       - User
 *      operationId: createUser
 *      requestBody:
 *        description: Request payload for creating a new user
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                realmName:
 *                  type: string
 *                  description: The name of the user's realm
 *                username:
 *                  type: string
 *                  description: The user's username
 *                firstName:
 *                  type: string
 *                  description: The user's first name
 *                lastName:
 *                  type: string
 *                  description: The user's last name
 *                email:
 *                  type: string
 *                  format: email
 *                  description: The user's email address
 *                password:
 *                  type: string
 *                  description: The user's password
 *              required:
 *                - realmName
 *                - username
 *                - firstName
 *                - lastName
 *                - email
 *                - password
 *      responses:
 *        '201':
 *          description: User created successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 'User created'
 *        '400':
 *          description: Bad Request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    examples:
 *                      validationError:
 *                        value: 'validation Error'
 *                      otherError:
 *                        value: 'Error message'
 *        '500':
 *          description: Internal Server Error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 'Server error'
 *
 */

userRouter.post("/", async (req, res) => {
  try {
    const data = await req.json();
    const app = req.locals.app;

    logger.info(data.realmName);

    await app
      .getCommandBus()
      .execute(
        new CreateUserCommand(
          data.realmName,
          data.username,
          data.firstName,
          data.lastName,
          data.email,
          data.password
        )
      );
    const message = `User created`;
    logger.info(message);
    res.status(201).json({ message: message });
  } catch (err: any) {
    logger.error(err.message);
    if (err instanceof ValidationError) {
      res.status(400).json({ message: err.errors });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

// workspaceRouter.put("/:id", async (req, res, next) => {
//   try {
//     const userId = req.params.id;
//     const updatedData = await req.json();
//     logger.info(`PUT /users/${userId}`);
//     logger.info(`Updated data: ${JSON.stringify(updatedData)}`);
//     res.json({ message: `User ${userId} updated`, data: updatedData });
//   } catch (err: any) {
//     logger.error(err.message);
//   }
// });

// workspaceRouter.delete("/:id", async (req, res, next) => {
//   try {
//     const userId = req.params.id;
//     logger.info(`DELETE /users/${userId}`);
//     res.json({ message: `User ${userId} deleted` });
//   } catch (err: any) {
//     next(err);
//   }
// });

export default userRouter;
