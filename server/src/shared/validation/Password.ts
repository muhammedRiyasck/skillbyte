export class password {
    
    public value: string;
    constructor(value: string) {
        if (!value || value.length < 6) {
        const error = new Error("Password must be at least 6 characters long")as any;
         error.status = 400
        throw error
        }else if(!/[A-Z]/.test(value) ) {
        const error = new Error("Password must contain at least one uppercase letter")as any;
         error.status = 400
        throw error
        }else if(!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        const error = new Error("Password must contain at least one special character")as any;
         error.status = 400
        throw error
        }else if(!/[a-z]/.test(value)) {
        const error = new Error("Password must contain at least one lowercase letter")as any;
         error.status = 400
        throw error
        }else if(!/[0-9]/.test(value)) {
        const error = new Error("Password must contain at least one number")as any
        error.status = 400
        throw error
        }else if(/[\s]/.test(value)) { 
        const error = new Error("Password must not contain spaces")as any;
         error.status = 400
        throw error
        }else if(/[^a-zA-Z0-9!@#$%^&*(),.?":{}|<>]/.test(value)) {
        const error = new Error("Password contains invalid characters")as any;
         error.status = 400
        throw error
        }else if(value.length > 20) {
        const error = new Error("Password must not exceed 20 characters")as any;
         error.status = 400
        throw error
        }
        this.value = value;
    }
    
   
    
    equals(other: password): boolean {
        return this.value === other.value;
    }
}
