import { Message } from 'discord.js';
import { DClient } from '../class/DClient';

module.exports = {
  name: 'quote-list',
  description: "List quotes from bot's library",
  execute(message: Message, _args: string[], client: DClient) {
    if (client.data.quotesList.length !== 0) {
      let s = 'List of available quotes is:';
      client.data.quotesList.forEach(q => {
        s += '\n\t' + q.name;
      });
      message.channel.send(s);
    } else {
      message.reply("Bots quote library is empty! Let's fill it, will ya?!");
    }
  }
};
