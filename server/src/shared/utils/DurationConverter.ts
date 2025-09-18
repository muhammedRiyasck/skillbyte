
export default function DurationConverter(durationStr: string): Date {
      const durationINString = durationStr;
    let calculatedDate: Date;
    if(durationINString=='Life Time Access'){
      // find the current date and add 100 years to it
      calculatedDate = new Date(new Date().setFullYear(new Date().getFullYear() + 100));

    }else if(durationINString==='1-Year Access'){
       calculatedDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    }else if(durationINString==='6-Months Access'){
       calculatedDate = new Date(new Date().setMonth(new Date().getMonth() + 6));
    }else{
      const error = new Error('Duration is not valid') as any;
      error.statusCode = 400;
      throw error;
    }
    return calculatedDate;
}
