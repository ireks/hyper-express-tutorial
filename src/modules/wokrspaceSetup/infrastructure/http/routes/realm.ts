import { Router } from "hyper-express";
import logger from "../../../../../shared/logger";
import { CreateRealmCommand } from "../../../application/commands/Commands";
import ValidationError from "../../../../../shared/Errors/ValidationError";
import ResourceExistsError from "../../../../../shared/Errors/ResourceExistsError";

const realmRouter = new Router();

// realmRouter.get("/", async (req, res, next) => {
//   try {
//     logger.info("GET /users");
//     res.json({ message: "List of users" });
//   } catch (err: any) {
//     next(err);
//   }
// });

// realmRouter.get("/:id", async (req, res, next) => {
//   try {
//     const userId = req.params.id;
//     logger.info(`GET /users/${userId}`);
//     res.json({ message: `User details for user ${userId}` });
//   } catch (err: any) {
//     next(err);
//   }
// });

/**
 * @swagger
 * /realm:
 *   post:
 *     summary: Create a new realm
 *     tags:
 *       - Realm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               realmName:
 *                 type: string
 *                 example: example.domain.com
 *     responses:
 *       201:
 *         description: Realm created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Realm created
 */
realmRouter.post("/", async (req, res) => {
  try {
    const data = await req.json();

    const app = req.locals.app;
    await app.getCommandBus().execute(new CreateRealmCommand(data.realmName));
    const message = `Realm created`;
    logger.info(message);
    res.status(201).json({ message: message });
  } catch (err: any) {
    logger.error(err.message);
    if (err instanceof ValidationError) {
      res.status(400).json({ message: "validation Error", errors: err.errors });
    } else if (err instanceof ResourceExistsError) {
      res.status(409).json({ message: "Resource exists Error" });
    } else {
      throw new Error(err.message);
    }
  }
});

// realmRouter.put("/:id", async (req, res, next) => {
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

// realmRouter.delete("/:id", async (req, res, next) => {
//   try {
//     const userId = req.params.id;
//     logger.info(`DELETE /users/${userId}`);
//     res.json({ message: `User ${userId} deleted` });
//   } catch (err: any) {
//     next(err);
//   }
// });

export default realmRouter;
