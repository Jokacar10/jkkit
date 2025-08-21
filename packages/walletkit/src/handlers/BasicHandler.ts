import { EventCallback } from '../types/internal';

export class BasicHandler<T> {
    private _notifyHandler: EventCallback<T>;

    constructor(notify: EventCallback<T>) {
        this._notifyHandler = notify;
    }

    async notify(event: T): Promise<void> {
        if (this._notifyHandler) {
            return await this._notifyHandler(event);
        }
        return Promise.resolve();
    }
}
