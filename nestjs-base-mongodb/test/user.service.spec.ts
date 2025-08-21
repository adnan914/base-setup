import { Test } from '@nestjs/testing';
import { UserService } from '../src/modules/user/user.service';
import { getModelToken } from '@nestjs/mongoose';
import { HashService } from '../src/shared/services/hash.service';

describe('UserService', () => {
    let svc: UserService;
    const userModelMock = {
        findOne: jest.fn().mockReturnValue({ lean: () => null }),
        find: jest.fn().mockReturnValue({ lean: () => [] }),
        save: jest.fn(),
    };
    beforeAll(async () => {
        const mod = await Test.createTestingModule({
            providers: [
                UserService,
                HashService,
                { provide: getModelToken('User'), useValue: userModelMock },
                { provide: 'AuthService', useValue: {} }, // forwardRef stub
            ],
        }).compile();

        svc = mod.get(UserService);
    });

    it('should be defined', () => {
        expect(svc).toBeDefined();
    });
});
