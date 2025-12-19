export interface Video {
    id: string;
    title: string;
    url: string;
    image_url: string;
    date: string;
}

export interface VideoApiResponse {
    result: string;
    msg: string;
    videos: Video[];
}

export interface VideoResponse {
    DATA: VideoApiResponse[];
}