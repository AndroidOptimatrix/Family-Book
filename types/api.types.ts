export interface ApiResponse<T = any> {
    DATA?: T;
    MESSAGE?: string;
    STATUS?: string;
    CODE?: number;
}