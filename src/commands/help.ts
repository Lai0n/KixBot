import { Message } from 'discord.js';
import { DClient } from '../class/DClient';

module.exports = {
  name: 'help',
  execute(message: Message, args: string[], client: DClient) {
    let hstr = '```';

    if (args.length > 0) {
      const command = client.commands.get(args[0]);

      if (command) {
        if (command.usage) {
          hstr += `${command.name} ${command.usage} - ${command.description}\n`;
        } else {
          hstr += `${command.name} - ${command.description}\n`;
        }
        if (command.examples) {
          hstr = hstr + `\t Examples:\n`;
          command.examples.forEach(e => {
            hstr += `\t${command.name} ${e}\n`;
          });
        }
      } else {
        message.reply("That command is nonexistent, use '!kix help' please.");
        return;
      }
    } else {
      const commands = client.commands.filter(c => {
        return c.name === 'help' ? false : true;
      });

      hstr += 'Kixbot knows these commands:\n\n';

      commands.forEach(c => {
        if (c.usage) {
          hstr += `\t${c.name} ${c.usage} - ${c.description}\n\n`;
        } else {
          hstr += `\t${c.name} - ${c.description}\n\n`;
        }
      });
    }
    hstr += '```';
    message.channel.send(hstr);
  }
};
