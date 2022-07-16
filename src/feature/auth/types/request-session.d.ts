export interface ReqSession {
    salt: string;
    username: string;
    loggedIn: boolean;
    socketioId?: string;
}
