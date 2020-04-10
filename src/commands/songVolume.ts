import { Message } from 'discord.js';
import { DClient } from '../class/DClient';

module.exports = {
  name: 'volume',
  description: 'Set volume for current queue.',
  usage: '<0-200>',
  execute(message: Message, args: string[], client: DClient) {
    const queue = client.guildQueues.get(message.guild.id);

    if (queue) {
      if (args.length > 0) {
        queue.volume = parseInt(args[0], 10);
      } else {
        message.reply(
          'You need to enter an number of value between 0 and 200!'
        );
      }
    } else {
      message.reply("Guild queue doesn't exist.");
    }
  }
};
