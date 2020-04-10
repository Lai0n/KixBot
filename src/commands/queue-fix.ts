import { Message } from 'discord.js';
import { DClient } from '../class/DClient';
import { GuildQueue } from '../class/GuildQueue';

module.exports = {
  name: 'queue-fix',
  description: 'Try to fix queue issues by destroying it.',
  execute(message: Message, _args: string[], client: DClient) {
    const queue = client.guildQueues.get(message.guild.id);
    if (queue) {
      GuildQueue.destroy(queue, client, message.guild.id);
      message.channel.send('Server queue was destroyed.');
    } else {
      message.reply("Guild queue doesn't exist.");
    }
  }
};
