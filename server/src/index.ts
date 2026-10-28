import { app } from "./app.ts";
import { env } from "./env.ts";

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
