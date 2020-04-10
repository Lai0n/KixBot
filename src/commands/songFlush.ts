import { Message } from 'discord.js';
import { DClient } from '../class/DClient';

module.exports = {
  name: 'flush',
  description: 'Flush songs queue.',
  execute(message: Message, _args: string[], client: DClient) {
    const queue = client.guildQueues.get(message.guild.id);

    if (queue) {
      queue.flushQueue();
    } else {
      message.reply("Guild queue doesn't exist.");
    }
  }
};
