
export interface User {
    id: number;
    email: string;
    username: string;
    hashedPassword: string;
    createdAt: Date;
    updatedAt: Date | undefined;
}
