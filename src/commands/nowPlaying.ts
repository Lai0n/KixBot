import { Message } from 'discord.js';
import { DClient } from '../class/DClient';

module.exports = {
  name: 'now',
  description: 'Print current playing song.',
  execute(message: Message, _args: string[], client: DClient) {
    const queue = client.guildQueues.get(message.guild.id);
    if (queue) {
      message.reply(`Now playing: **${queue.nowPlaying}**`);
    } else {
      message.reply("Guild queue doesn't exist.");
    }
  }
};
