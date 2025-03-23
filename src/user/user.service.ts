import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthService } from "src/auth/auth.service";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UserService {

    private readonly allowRegister: boolean;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { 
        this.allowRegister = configService.getOrThrow('ALLOW_REGISTER', false);
    }


    public async login(accessToken: string): Promise<string> {
        // TODO Exception
        const { name, given_name, family_name, email } = await this.authService.verifyToken(accessToken);
        const userNew = new User();
        userNew.email = email;
        userNew.givenName = given_name;
        userNew.familyName = family_name;
        userNew.name = name;
        //this.userRepository.save(user)
        const user = await this.userRepository.findOneBy({email})
        if (user === null) {
            // TODO
            throw Error();
        }
        return this.authService.sign(user.id)
    }
}