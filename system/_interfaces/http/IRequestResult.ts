import { RequestContext } from "../../_classes";

export default interface IRequestResult {
    execute(context: RequestContext): Promise<string> | void;
};