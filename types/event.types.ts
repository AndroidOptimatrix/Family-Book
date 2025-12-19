export interface Event {
    id: string,
    date: string,
    title: string,
    description: string,
    time: string,
    place: string,
    photo: string,
    result: string,
    msg: string
}

export interface EventData {
    DATA: Event[]
}