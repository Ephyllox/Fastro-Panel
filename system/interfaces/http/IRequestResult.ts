import { RequestContext } from "../../classes";

export default interface IRequestResult {
    execute(context: RequestContext): Promise<string> | void;
};