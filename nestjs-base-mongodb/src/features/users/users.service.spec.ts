import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole, UserStatus } from '@/shared/enums';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    roles: [UserRole.USER],
    status: UserStatus.ACTIVE,
    emailVerified: false,
    save: jest.fn(),
  };

  const mockUserModel = {
    new: jest.fn().mockResolvedValue(mockUser),
    constructor: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      jest.spyOn(mockUser, 'save').mockResolvedValue(mockUser as any);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith({ email: createUserDto.email });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockUser]),
      } as any);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await service.findById('1');

      expect(result).toEqual(mockUser);
      expect(model.findById).toHaveBeenCalledWith('1');
    });
  });
});
