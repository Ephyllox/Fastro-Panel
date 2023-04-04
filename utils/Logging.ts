export type LogColor =
    | "white"
    | "red"
    | "green"
    | "yellow"
    | "blue"
    | "magenta"
    | "cyan"
    | "gray";

export type LogColorBright =
    | "whiteBright"
    | "redBright"
    | "greenBright"
    | "yellowBright"
    | "blueBright"
    | "magentaBright"
    | "cyanBright";

type LogDelegate = (msg: string, color?: LogColor | LogColorBright) => void;

export default LogDelegate;