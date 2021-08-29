import { RequestContext } from "../../classes";

export default interface RequestResult {
    execute(context: RequestContext): Promise<string> | void;
};