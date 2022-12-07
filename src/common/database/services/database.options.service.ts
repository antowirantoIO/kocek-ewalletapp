import { Injectable } from '@nestjs/common';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { IDatabaseOptionsService } from 'src/common/database/interfaces/database.options-service.interface';
import { ENUM_APP_ENVIRONMENT } from 'src/app/constants/app.enum.constant';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class DatabaseOptionsService implements IDatabaseOptionsService {
    private readonly host: string;
    private readonly database: string;
    private readonly user: string;
    private readonly password: string;
    private readonly debug: boolean;
    private readonly options: string;
    private readonly env: string;

    constructor(private readonly configService: ConfigService) {
        this.env = this.configService.get<string>('app.env');
        this.host = this.configService.get<string>('database.host');
        this.database = this.configService.get<string>('database.name');
        this.user = this.configService.get<string>('database.user');
        this.password = this.configService.get<string>('database.password');
        this.debug = this.configService.get<boolean>('database.debug');

        this.options = this.configService.get<string>('database.options')
            ? `?${this.configService.get<string>('database.options')}`
            : '';
    }

    createMongoOptions(): MongooseModuleOptions {
        let uri = `${this.host}`;

        if (this.database) {
            uri = `${uri}/${this.database}${this.options}`;
        }

        if (this.env !== ENUM_APP_ENVIRONMENT.PRODUCTION) {
            mongoose.set('debug', this.debug);
        }

        const mongooseOptions: MongooseModuleOptions = {
            uri,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            autoCreate: true,
            // useMongoClient: true,
        };

        if (this.user && this.password) {
            mongooseOptions.auth = {
                username: this.user,
                password: this.password,
            };
        }

        return mongooseOptions;
    }

    createPostgresOptions(): TypeOrmModuleOptions {
        let uri = `${this.host}`;

        if (this.database) {
            uri = `${uri}/${this.database}${this.options}`;
        }

        const typeormOptions: Record<string, any> = {
            type: 'postgres',
            url: uri,
            retryDelay: 5000,
            logging:
                this.env === 'production' ? false : this.debug ? true : false,
            keepConnectionAlive: this.env === 'production' ? true : false,
            synchronize: this.env === 'production' ? false : true,
            entities: [
                __dirname +
                    '/../../../{common,modules}/**/**/repository/entities/*.entity{.ts,.js}',
            ],
            autoLoadEntities: true,
        };

        if (this.user && this.password) {
            typeormOptions.username = this.user;
            typeormOptions.password = this.password;
        }

        return typeormOptions;
    }
}
