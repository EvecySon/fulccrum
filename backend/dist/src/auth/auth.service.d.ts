import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        accessToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            firstName: string;
            lastName: string;
        };
        accessToken: string;
    }>;
    private signAccessToken;
}
