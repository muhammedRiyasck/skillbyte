export class password {
    
    public value: string;
    constructor(value: string) {
        if (!value || value.length < 6) {
        throw new Error("Password must be at least 6 characters long");
        }else if(!/[A-Z]/.test(value) ) {
        throw new Error("Password must contain at least one uppercase letter");
        }else if(!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        throw new Error("Password must contain at least one special character");
        }else if(!/[a-z]/.test(value)) {
        throw new Error("Password must contain at least one lowercase letter");
        }else if(!/[0-9]/.test(value)) {
        throw new Error("Password must contain at least one number")
        }else if(/[\s]/.test(value)) { 
        throw new Error("Password must not contain spaces");
        }else if(/[^a-zA-Z0-9!@#$%^&*(),.?":{}|<>]/.test(value)) {
        throw new Error("Password contains invalid characters");
        }else if(value.length > 20) {
        throw new Error("Password must not exceed 20 characters");
        }
        this.value = value;
    }
    
   
    
    equals(other: password): boolean {
        return this.value === other.value;
    }
}
