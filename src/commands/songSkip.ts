import { Message } from 'discord.js';
import { DClient } from '../class/DClient';

module.exports = {
  name: 'skip',
  description: 'Skip current song.',
  execute(message: Message, _args: string[], client: DClient) {
    const queue = client.guildQueues.get(message.guild.id);

    if (queue) {
      queue.skip(message, client);
    } else {
      message.reply("Guild queue doesn't exist.");
    }
  }
};
