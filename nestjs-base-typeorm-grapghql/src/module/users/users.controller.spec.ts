// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';
// import { AuthService } from '../auth/auth.service';
// import { CreateUserDto } from './dtos/CreateUser.dto';
// import { User, UserRole } from '../../typeorm/entities/user.entity';

// describe('UsersController', () => {
//   let controller: UsersController;
//   let service: UsersService;

//   const mockUsersService = {
//     findUsers: jest.fn().mockResolvedValue(['user1', 'user2']),
//     createUser: jest
//       .fn()
//       .mockImplementation((user: CreateUserDto) =>
//         Promise.resolve({ id: Date.now(), ...user }),
//       ),
//     findUserByEmail: jest.fn().mockResolvedValue(null),
//     hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
//   };

//   beforeEach(async () => {
//     // Mock implementations
//     usersService = {
//       findUsers: jest.fn().mockResolvedValue(['user1', 'user2']),
//       createUser: jest.fn(),
//       findUserByEmail: jest.fn(),
//     };
//     authService = {
//       login: jest.fn(),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UsersController],
//       providers: [
//         {
//           provide: UsersService,
//           useValue: mockUsersService,
//         },
//         AuthService,
//         {
//           provide: UsersService,
//           useValue: mockUsersService,
//         },
//       ],
//     }).compile();

//     controller = module.get<UsersController>(UsersController);
//   });

//   // Test cases for getUsers method
//   describe('getUsers', () => {
//     it('should return an array of users', async () => {
//       await expect(controller.getUsers()).resolves.toEqual({
//         success: true,
//         data: ['user1', 'user2'],
//       });
//       expect(mockUsersService.findUsers).toHaveBeenCalled();
//     });

//     it('should handle errors in getUsers', async () => {
//       jest
//         .spyOn(mockUsersService, 'findUsers')
//         .mockRejectedValueOnce(new Error('Failed to retrieve users'));
//       await expect(controller.getUsers()).resolves.toEqual({
//         success: false,
//         error: 'Failed to retrieve users',
//       });
//     });
//   });

//   // Test cases for signUpUser method
//   describe('signUpUser', () => {
//     it('should successfully sign up a user', async () => {
//       const createUserDto: CreateUserDto = {
//         email: 'test@example.com',
//         password: 'password123',
//         first_name: '',
//         last_name: '',
//       };

//       const mockUser: User = {
//         id: 1,
//         first_name: createUserDto.first_name,
//         last_name: createUserDto.last_name,
//         email: createUserDto.email,
//         password: createUserDto.password,
//         terms_agreed_at: new Date(), // Mock date for the test
//         photo_url: null,
//         verified: null,
//         verification_token: null,
//         bio: null,
//         role: UserRole.Employee, // Assuming a default role for the test
//         reset_password_token: null,
//         reset_password_sent_at: null,
//         isActive: true,
//       };

//       jest
//         .spyOn(mockUsersService, 'findUserByEmail')
//         .mockResolvedValueOnce(null);
//       jest
//         .spyOn(mockUsersService, 'createUser')
//         .mockResolvedValueOnce(mockUser);

//       await expect(controller.signUpUser(createUserDto)).resolves.toEqual({
//         success: true,
//         data: mockUser,
//       });
//     });

//     it('should handle existing user conflict during signUp', async () => {
//       const createUserDto: CreateUserDto = {
//         email: 'test@example.com',
//         password: 'password123',
//         first_name: '',
//         last_name: '',
//       };

//       // Create a mock user object
//       const mockUser: User = {
//         id: 1,
//         first_name: 'Existing',
//         last_name: 'User',
//         email: createUserDto.email, // Same email to simulate conflict
//         password: 'existing_password',
//         terms_agreed_at: new Date(),
//         photo_url: null,
//         verified: null,
//         verification_token: null,
//         bio: null,
//         role: UserRole.Employee,
//         reset_password_token: null,
//         reset_password_sent_at: null,
//         isActive: true,
//       };

//       await expect(controller.signUpUser(User)).resolves.toEqual({
//         success: true,
//         data: { accessToken: 'abc123' },
//       });
//     });

//     it('should handle user not found during login', async () => {
//       await expect(controller.login({})).resolves.toEqual({
//         success: false,
//         error: 'User not found',
//       });
//     });

//     it('should handle errors during login', async () => {
//       jest
//         .spyOn(AuthService, 'login')
//         .mockRejectedValueOnce(new Error('Login failed'));

//       await expect(
//         controller.login({ user: { email: 'test@example.com' } }),
//       ).resolves.toEqual({
//         success: false,
//         error: 'Login failed',
//       });
//     });
//   });
// });
