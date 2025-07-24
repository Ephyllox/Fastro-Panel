export type InputTypes = {
    body?: object;

    query: { [key: string]: string | string[] | undefined };
};

export type QueryOptions = {
    name: string;

    required?: boolean;
};