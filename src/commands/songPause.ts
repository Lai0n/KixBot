import { Message } from 'discord.js';
import { DClient } from '../class/DClient';

module.exports = {
  name: 'pause',
  description: 'Pause current playing song',
  execute(message: Message, _args: string[], client: DClient) {
    const queue = client.guildQueues.get(message.guild.id);

    if (queue) {
      queue.pause();
    } else {
      message.reply("Guild queue doesn't exist.");
    }
  }
};
