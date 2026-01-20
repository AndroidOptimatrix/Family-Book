export interface SupportProps {
    id: string,
    plateform: string,
    value: string,
    status: string
}

export interface SupportResponse {
    DATA: SupportProps[];
}
