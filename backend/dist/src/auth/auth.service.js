"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = __importDefault(require("../users/user.entity"));
const bcrypt = __importStar(require("bcryptjs"));
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(userRepository, jwtService, config) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.config = config;
    }
    signUp(signUpDto, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = signUpDto;
            const hashedPassword = yield bcrypt.hash(password, 10);
            const user = yield this.userRepository.create({
                name,
                email,
                password: hashedPassword,
            });
            yield this.userRepository.save(user);
            const tokens = yield this.getTokens(user.id, user.email);
            yield this.updateRtHash(user.id, tokens.refresh_token);
            response.setCookie("Refresh", tokens.refresh_token, {
                httpOnly: true,
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
            return {
                access_token: tokens.access_token,
                email,
                name,
            };
        });
    }
    login(loginDto, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = loginDto;
            const user = yield this.userRepository.findOne({
                where: { email },
            });
            if (!user) {
                throw new common_1.UnauthorizedException("Invalid email or password");
            }
            const isPasswordMatched = yield bcrypt.compare(password, user.password);
            if (!isPasswordMatched) {
                throw new common_1.UnauthorizedException("Invalid email or password");
            }
            const tokens = yield this.getTokens(user.id, user.email);
            yield this.updateRtHash(user.id, tokens.refresh_token);
            response.setCookie("Refresh", tokens.refresh_token, {
                domain: null,
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
            return {
                access_token: tokens.access_token,
                email,
                name: user.name,
            };
        });
    }
    refreshTokens(email, rt) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({
                where: { email },
            });
            if (!user || !user.hashedRt)
                throw new common_1.ForbiddenException("Access Denied");
            const rtMatches = yield bcrypt.compare(user.hashedRt, rt);
            if (!rtMatches)
                throw new common_1.ForbiddenException("Access Denied");
            const tokens = yield this.getTokens(user.id, user.email);
            yield this.updateRtHash(user.id, tokens.refresh_token);
            return { access_token: tokens.access_token, email, name: user.name };
        });
    }
    logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userRepository.update({ id: userId, hashedRt: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) }, { hashedRt: null });
            return true;
        });
    }
    updateRtHash(id, rt) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = yield bcrypt.hash(rt, 10);
            yield this.userRepository.update({ id }, { hashedRt: hash });
        });
    }
    getTokens(id, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const jwtPayload = {
                id,
                email,
            };
            const [access_token, refresh_token] = yield Promise.all([
                this.jwtService.signAsync(jwtPayload, {
                    secret: this.config.get("JWT_SECRET"),
                    expiresIn: "15m",
                }),
                this.jwtService.signAsync(jwtPayload, {
                    secret: this.config.get("JWT_REFRESH_TOKEN_SECRET"),
                    expiresIn: "7d",
                }),
            ]);
            return {
                access_token,
                refresh_token,
            };
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.default)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
