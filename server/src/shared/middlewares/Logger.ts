
const Logger = (req:any, res:any, next:any) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`)
    console.log(`Request Headers: ${JSON.stringify(req.headers)}`);
    console.log(`Request Body: ${JSON.stringify(req.body)}`);
    next();
}

export default Logger;
