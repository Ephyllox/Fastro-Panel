import { RequestContext } from "../../_classes";

export default interface IRequestResult { //eslint-disable-line
    execute(context: RequestContext): Promise<string> | void;
};