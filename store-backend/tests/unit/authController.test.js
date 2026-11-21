jest.mock('../../models/managerModel', () => ({
  findByUsername: jest.fn(),
}));
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const managerModel = require('../../models/managerModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { login } = require('../../controllers/authController');

const makeResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe('POST /api/admin/login controller logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'unit-test-secret';
    delete process.env.JWT_EXPIRES_IN;
  });

  test('returns 400 when username or password is missing', async () => {
    const res = makeResponse();
    await login({ body: { username: '' } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Username and password are required',
    });
    expect(managerModel.findByUsername).not.toHaveBeenCalled();
  });

  test('returns 401 when the password is incorrect', async () => {
    const manager = { _id: 'manager-1', password: 'hashed-password' };
    managerModel.findByUsername.mockResolvedValue(manager);
    bcrypt.compare.mockResolvedValue(false);

    const res = makeResponse();
    await login(
      { body: { username: 'manager@example.com', password: 'wrong' } },
      res,
      jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid username or password',
    });
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test('returns a token for valid credentials', async () => {
    const manager = {
      _id: 'manager-1',
      username: 'manager',
      password: 'hashed-password',
    };
    managerModel.findByUsername.mockResolvedValue(manager);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-jwt-token');

    const res = makeResponse();
    await login(
      {
        body: {
          username: ' manager ',
          password: 'Manager123!',
        },
      },
      res,
      jest.fn()
    );

    expect(managerModel.findByUsername).toHaveBeenCalledWith('manager');
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'manager-1' },
      'unit-test-secret',
      { expiresIn: '1d' }
    );
    expect(res.json).toHaveBeenCalledWith({
      token: 'mock-jwt-token',
    });
  });
});
