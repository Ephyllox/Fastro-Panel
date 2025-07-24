export type LogEventType =
    | "system"
    | "security"
    | "audit";

export type LogEventSeverity =
    | "debug"
    | "warning"
    | "error";

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

type LogDelegate = (msg: string, color?: LogColor | LogColorBright, type?: LogEventType) => void;

export default LogDelegate;