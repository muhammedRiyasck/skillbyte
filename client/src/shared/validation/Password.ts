  export default function validatePassword(password:string):{success: boolean, message: string} {
        

        const uppercaseRegex = /[A-Z]/;
        const specialCharRegex = /[@$!%*?&]/;
        const numberRegex = /\d/;
        // const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{10,}$/;
        // password must be at least 8 characters
        const minLengthRegex = /^.{6,}$/;
        // const mediumRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%?&]{6,}$/;

        password = password.trim();

        console.log(password, 'checking password validation');

        if (password === "") {
            return {success: false, message: 'Password is required'};
         
        } else if (!uppercaseRegex.test(password)) {
        
            return {success: false, message: 'Include at least one uppercase letter.'};
         
        } else if (!specialCharRegex.test(password)) {

            return {success: false, message: 'Include at least one special character.'};
          
        } else if (!numberRegex.test(password)) {

            return {success: false, message: 'Include at least one number.'};
          
        } else if(!minLengthRegex.test(password)) {
            
            return {success: false, message: 'Password must be at least 6 characters long.'};
          
        } else {
            return {success: true, message: ''};
        }

           
    }




