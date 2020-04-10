import {
  VoiceChannel,
  TextChannel,
  VoiceConnection,
  NewsChannel,
  DMChannel,
  Message,
  Snowflake
} from 'discord.js';
import { DClient } from './DClient';
import { Song } from './Song';
import { log, between, seconds2time, ytDuration2seconds } from '../helpers';
import * as path from 'path';
import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import ytsr from 'ytsr';
import * as prism from 'prism-media';

export interface QuildQueueInfo {
  readonly songCountString: string;
  readonly durationString: string;
}

declare interface SongListPromise {
  readonly playListTitle?: string;
  readonly songs: Song[];
}

export class GuildQueue {
  public static play(message: Message, song: Song, client: DClient): void {
    const queue = client.guildQueues.get(message.guild.id);
    let dispatcher;

    if (!song || typeof song === 'undefined') {
      queue.voiceChannel.leave();
      queue.PlayerIsPlaying = false;
      return;
    }

    if (song.srcType === Song.SongSrcType.YOUTUBE_URL) {
      const args = [
        '-analyzeduration',
        '0',
        '-loglevel',
        '0',
        '-f',
        's16le',
        '-ar',
        '48000',
        '-ac',
        '2',
        '-reconnect',
        '1',
        '-reconnect_streamed',
        '1',
        '-reconnect_delay_max',
        '4'
      ];
      if (queue.PlayerIsInterrupted) {
        args.unshift('-ss', String(queue.interrupted_At / 1000));

        const input = ytdl(song.src);
        const ffmpeg = new prism.FFmpeg({ args });
        input.pipe(ffmpeg);

        dispatcher = queue.connection.play(ffmpeg, {
          highWaterMark: 256,
          type: 'converted'
        });
      } else {
        const input = ytdl(song.src);
        const ffmpeg = new prism.FFmpeg({ args });
        input.pipe(ffmpeg);

        dispatcher = queue.connection.play(ffmpeg, {
          highWaterMark: 256,
          type: 'converted'
        });
      }
    } else if (song.srcType === Song.SongSrcType.REGULAR_URL) {
      if (queue.PlayerIsInterrupted) {
        dispatcher = queue.connection.play(song.src, {
          highWaterMark: 256,
          seek: queue.interrupted_At / 1000
        }); // cuz FFMpeg's seek is in seconds
      } else {
        dispatcher = queue.connection.play(song.src, {
          highWaterMark: 64
        });
      }
    } else {
      if (queue.PlayerIsInterrupted) {
        dispatcher = queue.connection.play(song.src, {
          seek: queue.interrupted_At / 1000
        });
      } else {
        dispatcher = queue.connection.play(song.src);
      }
    }

    if (!queue.PlayerIsPlaying) {
      dispatcher.pause(true);
    }

    if (queue.PlayerIsInterrupted) {
      queue.PlayerIsInterrupted = false;
    }

    dispatcher
      .on('finish', () => {
        queue.songs.shift();
        this.play(message, queue.songs[0], client);
      })
      .on('error', error => {
        message.channel.send(
          "Oh no something happened. I'm sorry, i can't play that one right now."
        );
        log.error(error);
      });

    dispatcher.setVolume(queue.volume / 100);
    queue.textChannel.send(`Started playing: **${song.title}**`);
  }

  public static async createSongList(
    title: string,
    client: DClient
  ): Promise<SongListPromise> {
    let SongSrcType: Song.SongSrcType = Song.srcTypeGet(title);
    const songs: Song[] = [];
    let found: boolean = false;
    let p: string = null;
    let err: boolean = false;
    let playListTitle: string = null;
    // prepisat to na detekciu typu linku pre yt a kompletne vyhodit tuto picovinu s isPlaylist shitom a miesto toho hodit do TITLE_ONLY searchu check ze co je to za ty a podla typu sa bude pokracovat dalej

    switch (SongSrcType) {
      case Song.SongSrcType.TITLE_ONLY:
        // try to find song in local files
        client.data.songsList.forEach(s => {
          if (s.name === title) {
            found = true;
            p = path.join(client.data.songsPath, s.name + s.ext);
          }
        });

        // found, so play it
        if (found) {
          songs.push(new Song(title, p, SongSrcType));
        } else {
          // didn't found try to look on youtube
          SongSrcType = Song.SongSrcType.YOUTUBE_URL;

          await ytsr(title, { limit: 1 })
            .then(async r => {
              if (r.items[0].type === 'playlist') {
                playListTitle = r.items[0].title;
                await ytpl(r.items[0].link, { limit: 1 }).then(rr => {
                  rr.items.forEach(i => {
                    songs.push(
                      new Song(
                        i.title,
                        i.url,
                        SongSrcType,
                        ytDuration2seconds(i.duration)
                      )
                    );
                  });
                });
              } else {
                songs.push(
                  new Song(
                    r.items[0].title,
                    r.items[0].link,
                    SongSrcType,
                    ytDuration2seconds(r.items[0].duration)
                  )
                );
              }
            })
            .catch((e: any) => {
              log.error(e);
              err = true;
            });
        }
        break;

      case Song.SongSrcType.REGULAR_URL:
        songs.push(new Song(title, title, SongSrcType));
        break;

      case Song.SongSrcType.YOUTUBE_URL:
        if (title.includes('list=')) {
          await ytpl(title, { limit: 1 }).then(rr => {
            playListTitle = rr.title;
            rr.items.forEach(i => {
              songs.push(
                new Song(
                  i.title,
                  i.url,
                  SongSrcType,
                  ytDuration2seconds(i.duration)
                )
              );
            });
          });
        } else {
          const songInfo = await ytdl.getInfo(title);
          songs.push(
            new Song(
              songInfo.title,
              songInfo.video_url,
              SongSrcType,
              parseInt(songInfo.length_seconds, 10)
            )
          );
        }
        break;

      default:
        break;
    }

    if (err) {
      return Promise.reject();
    } else {
      return Promise.resolve({
        songs,
        playListTitle
      });
    }
  }

  public static addToQueue(
    title: string,
    client: DClient,
    message: Message
  ): void {
    this.createSongList(title, client)
      .then(async (list: SongListPromise) => {
        let queue = client.guildQueues.get(message.guild.id);
        if (!queue) {
          queue = new GuildQueue(
            message.channel,
            message.member.voice.channel,
            list.songs
          );

          client.guildQueues.set(message.guild.id, queue);

          try {
            queue.connection = await message.member.voice.channel.join();
            this.play(message, queue.songs[0], client);
          } catch (err) {
            log.error(err);
            client.guildQueues.delete(message.guild.id);
            message.channel.send(err);
            return;
          }
        } else {
          queue.songs = queue.songs.concat(list.songs);

          if (list.songs.length > 1) {
            message.channel.send(
              `Adding ${list.songs.length} songs from youtube a playlist **${list.playListTitle}** to the queue.`
            );
          } else {
            message.channel.send(
              `Song **${list.songs[0].title}** has been added to the queue!`
            );
          }

          if (!queue.isPlaying && queue.songs.length === 1) {
            queue.connection = await message.member.voice.channel.join();
            queue.PlayerIsPlaying = true;

            this.play(message, queue.songs[0], client);
          }
        }
      })
      .catch(() => {
        message.reply("I'm sorry, I can't play that right now!");
      });
  }

  public static destroy(
    queue: GuildQueue,
    client: DClient,
    guildId: Snowflake
  ): void {
    if (queue.voiceChannel) {
      queue.voiceChannel.leave();
    }
    client.guildQueues.delete(guildId);
  }

  public textChannel: TextChannel | DMChannel | NewsChannel;
  public voiceChannel: VoiceChannel;
  public connection?: VoiceConnection;
  private songs: Song[];
  private PlayerVolume: number;
  private PlayerIsPlaying: boolean;
  private PlayerIsInterrupted: boolean;
  private PlayerWasInterruptedAt?: number;

  constructor(
    textChannel: TextChannel | DMChannel | NewsChannel,
    voiceChannel: VoiceChannel,
    songs: Song[]
  ) {
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.songs = songs;
    this.PlayerIsPlaying = true;
    this.PlayerIsInterrupted = false;
    this.PlayerVolume = 100;
  }

  get volume(): number {
    return this.PlayerVolume;
  }
  get isPlaying(): boolean {
    return this.PlayerIsPlaying;
  }
  get isInterrupted(): boolean {
    return this.PlayerIsInterrupted;
  }
  get interrupted_At(): number {
    return this.PlayerWasInterruptedAt;
  }
  get nowPlaying(): Song {
    return this.songs[0];
  }

  set volume(v: number) {
    if (between(v, 0, 200)) {
      this.setVolume(v);
    }
  }

  public earRape(v: number) {
    this.setVolume(v);
  }
  public pause(): void {
    if (
      this.connection &&
      this.connection.dispatcher &&
      !this.PlayerIsInterrupted
    ) {
      this.PlayerIsPlaying = false;
      this.connection.dispatcher.pause(true);
    }
  }
  public resume(): void {
    if (
      this.connection &&
      this.connection.dispatcher &&
      !this.PlayerIsInterrupted
    ) {
      this.PlayerIsPlaying = true;
      this.connection.dispatcher.resume();
    }
  }
  public skip(message: Message, client: DClient): void {
    if (this.connection && !this.PlayerIsInterrupted) {
      this.songs.shift();
      GuildQueue.play(message, this.songs[0], client);
    }
  }
  public flushQueue(): void {
    this.songs = [];
    if (this.voiceChannel) {
      this.voiceChannel.leave();
      this.PlayerIsPlaying = false;
    }
  }
  public interrupt(): void {
    if (
      this.connection &&
      this.connection.dispatcher &&
      !this.PlayerIsInterrupted
    ) {
      this.connection.dispatcher.pause();
      this.PlayerIsInterrupted = true;
      this.PlayerWasInterruptedAt = this.connection.dispatcher.streamTime;
    }
  }
  public getInfo(): QuildQueueInfo {
    let duration = 0;
    let approximately = false;
    if (this.songs.length) {
      this.songs.forEach(s => {
        if (s.duration !== -1) {
          approximately = true;
        } else {
          duration += s.duration;
        }
      });
      return {
        durationString: approximately
          ? '~' + seconds2time(duration)
          : seconds2time(duration),
        songCountString:
          this.songs.length === 1 ? '1 song' : `${this.songs.length} songs`
      };
    }

    return {
      durationString: 'NaN',
      songCountString: 'Server queue is empty.'
    };
  }

  private setVolume(v: number): void {
    if (v > 0) {
      this.PlayerVolume = v;
      if (
        this.connection &&
        this.connection.dispatcher &&
        !this.PlayerIsInterrupted
      ) {
        this.connection.dispatcher.setVolume(v / 100);
      }
    }
  }
}
