import { Message } from 'discord.js';
import { DClient } from '../class/DClient';

module.exports = {
  name: 'song-list',
  description: "List songs from bot's library",
  execute(message: Message, _args: string[], client: DClient) {
    if (client.data.songsList.length !== 0) {
      let s = 'List of available songs is:';
      client.data.songsList.forEach(q => {
        s += '\n\t' + q.name;
      });
      message.channel.send(s);
    } else {
      message.reply("Bots song library is empty! Let's fill it, will ya?!");
    }
  }
};
