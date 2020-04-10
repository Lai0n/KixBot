import { Message } from 'discord.js';
import { DClient } from '../class/DClient';

module.exports = {
  name: 'queue-info',
  description: "Print guild's queue info.",
  execute(message: Message, _args: string[], client: DClient) {
    const queue = client.guildQueues.get(message.guild.id);

    if (queue) {
      const info = queue.getInfo();
      message.channel.send(
        `Guild queue info:\n` +
          `\tSong list: ${info.songCountString}\n` +
          `\tTotal queue time left: ${info.durationString}`
      );
    } else {
      message.reply("Guild queue doesn't exist.");
    }
  }
};
