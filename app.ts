import startServer from "./src/server";
import { dbSetup } from "./src/setup/dbSetup";
import { startSocketServer } from "./src/sockets";

(async () => {
  await startServer();
  await startSocketServer();
  dbSetup();
})();
