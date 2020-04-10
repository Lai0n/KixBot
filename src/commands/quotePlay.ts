import { Message, StreamDispatcher } from 'discord.js';
import { DClient } from '../class/DClient';
import * as path from 'path';
import { log } from '../helpers';
import { GuildQueue } from '../class/GuildQueue';

module.exports = {
  name: 'quote',
  description: "Play an quote from bot's library",
  usage: '<quote name>',
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
        let found = false;
        const quoteName = args.join(' ');
        let p: any = null;
        let dispatcher: StreamDispatcher;

        client.data.quotesList.forEach(q => {
          if (q.name === quoteName) {
            found = true;
            p = path.join(client.data.quotesPath, q.name + q.ext);
          }
        });

        if (found) {
          const queue = client.guildQueues.get(message.guild.id);

          if (queue) {
            try {
              if (queue.isPlaying) {
                queue.interrupt();
              }

              if (queue.connection) {
                dispatcher = queue.connection.play(p);
              } else {
                queue.voiceChannel.join().then(c => {
                  dispatcher = c.play(p);
                });
              }

              dispatcher
                .on('finish', () => {
                  GuildQueue.play(message, queue.nowPlaying, client);
                })
                .on('error', (error: any) => {
                  message.channel.send(
                    "Oh no something happened. I'm sorry, i can't play that one right now."
                  );
                  log.error(error);
                });
            } catch (err) {
              log.error(err);
              message.channel.send(
                "Oh no something happened. I'm sorry, i can't play that one right now."
              );
              return;
            }
          } else {
            try {
              const voiceChannel = message.member.voice.channel;
              const connection = await voiceChannel.join();
              dispatcher = connection.play(p);
              dispatcher
                .on('finish', () => {
                  voiceChannel.leave();
                })
                .on('error', error => {
                  message.channel.send(
                    "Oh no something happened. I'm sorry, i can't play that one right now."
                  );
                  log.error(error);
                });
            } catch (err) {
              log.error(err);
              message.channel.send(
                "Oh no something happened. I'm sorry, i can't play that one right now."
              );
              return;
            }
          }
        } else {
          message.reply(
            "I'm sorry, that quote is nonexistent! Please use 'quote-list' to found out which quotes are available!"
          );
        }
      } else {
        message.reply('You need to enter a name of quote to play.');
      }
    } else {
      message.reply('You need to join a voice channel first!');
    }
  }
};
