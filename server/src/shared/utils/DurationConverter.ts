import { ERROR_MESSAGES } from "../constants/messages";
import { HttpStatusCode } from "../enums/HttpStatusCodes";
import { HttpError } from "../types/HttpError";

export default function DurationConverter(durationStr: string): Date {
      const durationINString = durationStr;
    let calculatedDate: Date;
    if(durationINString=='Life Time Access'){
      // find the current date and add 100 years to it
      calculatedDate = new Date(new Date().setFullYear(new Date().getFullYear() + 100));
    }else if(durationINString==='1-Year Access'){
       calculatedDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    }else if(durationINString==='6-Month Access'){
       calculatedDate = new Date(new Date().setMonth(new Date().getMonth() + 6));
    }else{

   throw new HttpError(ERROR_MESSAGES.DURATION_NOT_VALID, HttpStatusCode.BAD_REQUEST);

    }
    return calculatedDate;
}
