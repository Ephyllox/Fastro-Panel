export type InputTypes = {
    body?: any;

    query: { [key: string]: string | string[] | undefined };
};

export type QueryOptions = {
    name: string;

    required?: boolean;
};