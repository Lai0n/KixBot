import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { log } from '../helpers';
import { Message, VoiceConnection } from 'discord.js';
import { DClient } from '../class/DClient';
import ffmpeg from 'ffmpeg-static';

function record(
  quoteName: string,
  conn: VoiceConnection,
  message: Message,
  client: DClient,
  leaveAfter: boolean
) {
  const audio = conn.receiver.createStream(message.author, { mode: 'pcm' });
  const p = path.join(client.data.quotesPath, quoteName + '.RAWPCM');

  log.event(
    `User '${message.author.id}' commanded me to record new quote named: '${quoteName}'.`
  );

  log.system(`Opening path: ${p}`);
  const rawStream = fs.createWriteStream(p);

  rawStream.on('close', () => {
    log.event('User has stopped talking, conversion starting.');

    exec(
      `${ffmpeg} -f s16le -ar 48k -ac 2 -i "${path.join(
        client.data.quotesPath,
        quoteName + '.RAWPCM'
      )}" -b:a 192k "${path.join(client.data.quotesPath, quoteName + '.mp3')}"`,
      (error, _stdout, stderr) => {
        fs.unlink(p, err => {
          if (err) {
            log.error(err);
          }
        });

        if (error) {
          console.log('YOO');
          log.error(error.message);
          return;
        }
        if (stderr) {
          console.log('YONT');
          log.warn(stderr);
          return;
        }

        log.system(`Conversion for quote '${quoteName}' has stopped.`);

        client.data.quotesList.push({ name: quoteName, ext: '.mp3' });
        message.reply(
          `A new quote was added to the list! Let\'s try it! ( quote ${quoteName} )`
        );

        if (leaveAfter) {
          message.member.voice.channel.leave();
        }
      }
    );
  });

  audio.pipe(rawStream);
}

module.exports = {
  name: 'quote-record',
  description: "Record an quote to bot's library",
  usage: '<quote name>',
  execute(message: Message, args: string[], client: DClient) {
    if (message.member.voice.channel) {
      const permissions = message.member.voice.channel.permissionsFor(
        message.client.user
      );
      if (!permissions.has('CONNECT')) {
        message.channel.send(
          'I need the permissions to join in your voice channel!'
        );
        return;
      }

      if (args.length >= 1) {
        const quoteName = args.join(' ');
        const queue = client.guildQueues.get(message.guild.id);

        if (queue) {
          if (queue.voiceChannel) {
            if (message.member.voice.channel.equals(queue.voiceChannel)) {
              if (queue.connection) {
                record(quoteName, queue.connection, message, client, false);
              } else {
                queue.voiceChannel
                  .join()
                  .then(conn => {
                    record(quoteName, conn, message, client, false);
                  })
                  .catch(e => {
                    log.error(e);
                    message.reply(
                      "Oh no! Something happened. I', sorry I can't record right now."
                    );
                  });
              }
            } else {
              message.reply(
                'You need to join a voice channel where is the bot currently first!'
              );
            }
          } else {
            // bot is not in any voice channel
            message.member.voice.channel
              .join()
              .then(conn => {
                record(quoteName, conn, message, client, true);
              })
              .catch(e => {
                log.error(e);
                message.reply(
                  "Oh no! Something happened. I', sorry I can't record right now."
                );
              });
          }
        } else {
          // no server queue exists
          message.member.voice.channel
            .join()
            .then(conn => {
              record(quoteName, conn, message, client, true);
            })
            .catch(e => {
              log.error(e);
              message.reply(
                "Oh no! Something happened. I', sorry I can't record right now."
              );
            });
        }
      } else {
        message.reply('You need to enter a name of quote to record.');
      }
    } else {
      message.reply('You need to join a voice channel first!');
    }
  }
};
