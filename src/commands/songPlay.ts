import { Message } from 'discord.js';
import { DClient } from '../class/DClient';
import { GuildQueue } from '../class/GuildQueue';

module.exports = {
  name: 'play',
  description: "Play a song from bot's library or youtube or http served file",
  usage: '<song name>',
  examples: [
    'Mood wanna be shuffle',
    'https://www.youtube.com/playlist?list=PLW-6EP_T_mo0tcvlOkVzyntS59ZKXtugG',
    'https://www.youtube.com/watch?v=lcg6wekmCRA',
    'wolf',
    'http://example.com/aloha.mp3'
  ],
  async execute(message: Message, args: string[], client: DClient) {
    if (message.member.voice.channel) {
      const permissions = message.member.voice.channel.permissionsFor(
        message.client.user
      );
      if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        message.channel.send(
          'I need the permissions to join and speak in your voice channel!'
        );
        return;
      }

      if (args.length >= 1) {
        const title = args.join(' ');

        GuildQueue.addToQueue(title, client, message);
      } else {
        message.reply('You need to enter a name of song to play.');
      }
    } else {
      message.reply('You need to join a voice channel first!');
    }
  }
};
