import realm from "./routes/realm";
import user from "./routes/user";

import { Server } from "hyper-express";

export default function registerRoutes(server: Server){
    server.use("/realm",realm);
    server.use("/user",user);
}
