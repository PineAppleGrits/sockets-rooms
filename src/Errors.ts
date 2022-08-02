class BaseError extends Error {
  public static SOCKET_NOT_FOUND: (id?: string | number) => string = (
    id = undefined
  ) => `Socket ${id} doesnt exist`;
  public static ROOM_NOT_FOUND: (id?: string | number) => string = (
    id = undefined
  ) => `Room ${id} doesnt exist`;
  public static NO_ID: string = `No id provided`;
  public static UNIQUE_ID: string = `IDs must be unique`;
  public static UNKNOWN: string = `Unkown error`;
  public static ROOM_EMPTY: string = `Room is empty.`;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = Error.name;
    Error.captureStackTrace(this);
  }
}

export default BaseError;
