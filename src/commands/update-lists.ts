import { Message } from 'discord.js';
import { DClient } from '../class/DClient';
import { log } from '../helpers';

module.exports = {
  name: 'update-lists',
  description: "Update lists of bot's songs and quotes library",
  execute(message: Message, _args: string[], client: DClient) {
    client.updateLibraryData();
    log.event('Library lists were updated!');
    message.channel.send('Library lists were updated!');
  }
};
