declare module 'ytsr' {
  namespace ytsr {
    type options = {
      safeSearch?: boolean;
      limit?: number;
      nextpageRef?: string;
    };

    type result = {
      query: string;
      items: {
        type: string;
        title: string;
        link: string;
        thumbnail: string;
        author: {
          name: string;
          ref: string;
          verified: boolean;
        };
        description: string;
        meta?: string[];
        actors?: string[];
        director?: string;
        duration: string;
        uploaded_at?: string;
        views?: number;
        length?: string;
      }[];
      nextpageRef: string;
      results: string | number;
      filters: {
        ref: string | null;
        name: string;
        active: boolean;
      }[];
      currentRef: string | null;
    };
  }

  function ytsr(
    searchString: string,
    options: ytsr.options,
    callback: (err: any, result?: ytsr.result) => void
  ): void;
  function ytsr(
    searchString: string,
    options: ytsr.options
  ): Promise<ytsr.result>;
  export = ytsr;
}
