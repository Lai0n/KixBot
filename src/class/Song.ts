import { isURL, isYoutubeURL } from '../helpers';
import { getAudioDurationInSeconds } from 'get-audio-duration';

export class Song {
  public static srcTypeGet(src: string): Song.SongSrcType {
    if (isURL(src)) {
      if (isYoutubeURL(src)) {
        return Song.SongSrcType.YOUTUBE_URL;
      } else {
        return Song.SongSrcType.REGULAR_URL;
      }
    } else {
      return Song.SongSrcType.TITLE_ONLY;
    }
  }
  public readonly title: string;
  public readonly srcType: Song.SongSrcType;
  public readonly src: string;
  public readonly duration: number;

  constructor(
    title: string,
    src: string,
    srcType: Song.SongSrcType,
    duration: number = null
  ) {
    this.title = title;
    this.src = src;
    this.srcType = srcType;

    // for yt song type will be duration passed down from api response
    if (duration == null) {
      if (this.srcType === Song.SongSrcType.REGULAR_URL) {
        this.duration = -1;
      } // -1 is for unknown duration, when song with this duration exists in queue the queues duration will show for example like this: "~0:40:22"
      else {
        let _d = -1;
        getAudioDurationInSeconds(src).then(d => {
          _d = d;
        });
        this.duration = _d;
      }
    } else {
      this.duration = duration;
    }
  }
}

export namespace Song {
  export enum SongSrcType {
    TITLE_ONLY,
    REGULAR_URL,
    YOUTUBE_URL
  }
}
