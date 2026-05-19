import dotenv from "dotenv";
import { App } from "@slack/bolt";

import { registerAssignCommand } from "./commands/assign";
import { registerMyTasksCommand } from "./commands/mytasks";
import { registerCompleteCommand } from "./commands/complete";
import { startReminderService } from "./services/remainderService";

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  port: 3000,
});

registerAssignCommand(app);
registerMyTasksCommand(app);
registerCompleteCommand(app);
startReminderService(app);

(async () => {
  await app.start();

  console.log("⚡ Slack Bot Running on Port 3000");
})();