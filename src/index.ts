import { DClient } from './class/DClient';
import { log } from './helpers';
import { Message } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const client = new DClient();

log.system('Starting bot...');

// => Bot is ready...
client.on('ready', () => {
  if (client.user) {
    log.system(`Bot is logged in as ${client.user.tag}!`);
  }
});

// => Message handler
client.on('message', (message: Message) => {
  // => Prevent message from the bot
  client.commandProcessor(message);
});

// => Bot error and warn handler
client.on('error', log.error);
client.on('warn', log.warn);

// => Process handler
process.on('exit', () => {
  log.event(`This bot is going to sleep now.`);
  client.destroy();
});

process.on('uncaughtException', (err: Error) => {
  const errorMsg = (err ? err.stack || err : '')
    .toString()
    .replace(new RegExp(`${__dirname}\/`, 'g'), './');
  log.error(errorMsg);
});

// => Login
client
  .login(process.env.BOT_TOKEN)
  .then(() => {
    client.updateLibraryData();
  })
  .catch(e => {
    log.error(e);
    process.exit(1);
  });
