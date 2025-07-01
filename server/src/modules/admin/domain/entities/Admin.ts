
export class Admin {
    constructor(
        public name: string,
        public email: string,
        public passwordHash: string,
        public role: "admin" | "superadmin",
        public isEmailVerified: boolean = false,
        public accountStatus: "active" | "blocked" | "suspended" = "active",
        public profilePictureUrl?: string | null,
        public _id?: string // Optional ID for database storage
    ) {}
   
}
