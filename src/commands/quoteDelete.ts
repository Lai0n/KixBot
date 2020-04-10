import * as path from 'path';
import * as fs from 'fs';
import { Message } from 'discord.js';
import { DClient } from '../class/DClient';
import { log } from '../helpers';

module.exports = {
  name: 'quote-delete',
  description: "Delete an quote from bot's library",
  usage: '<quote name>',
  execute(message: Message, args: string[], client: DClient) {
    if (message.member.voice.channel) {
      if (args.length >= 1) {
        const quoteName = args.join(' ');
        const quoteIndex = client.data.quotesList.findIndex(
          q => q.name === quoteName
        );
        let found = false;
        let p = null;
        log.event(
          `User '${message.author.id}' commanded me to delete the quote named: '${quoteName}'.`
        );

        client.data.quotesList.forEach(q => {
          if (q.name === quoteName) {
            found = true;
            p = path.join(client.data.quotesPath, q.name + q.ext);
          }
        });

        if (found) {
          fs.unlink(p, err => {
            if (err) {
              message.reply("The quote wasn't deleted due to unknown error.");
              log.error(err);
              return;
            }
            client.data.quotesList.splice(quoteIndex, 1);
            message.reply('The quote was successfuly deleted.');
          });
        } else {
          message.reply("You've entered name of nonexistent quote.");
        }
      } else {
        message.reply('You need to enter a name of quote to delete.');
      }
    } else {
      message.reply('You need to join a voice channel first!');
    }
  }
};
