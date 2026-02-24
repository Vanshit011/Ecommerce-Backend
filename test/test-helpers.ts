import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * Test user credentials for integration tests
 */
export const TEST_USERS = {
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@test.com',
    password: 'Admin@123',
    mobile: '1234567890',
    name: 'Test Admin',
    role: 'admin', // lowercase to match UserRole enum
  },
  user: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'user@test.com',
    password: 'User@123',
    mobile: '0987654321',
    name: 'Test User',
    role: 'user', // lowercase to match UserRole enum
  },
};

/**
 * Clean all tables in the database
 * @param dataSource TypeORM DataSource
 */
export async function cleanDatabase(dataSource: DataSource): Promise<void> {
  try {
    // Define deletion order manually to respect foreign key constraints
    const tableOrder = [
      'order_items',
      'orders',
      'payments',
      'cart_items',
      'favorites',
      'addresses',
      'product_images',
      'products',
      'categories',
      'otps',
      'tokens',
      'users', // Changed from 'user' to 'users' to match actual table name
    ];

    // Delete in specified order
    for (const tableName of tableOrder) {
      try {
        await dataSource.query(`DELETE FROM "${tableName}"`);
      } catch (error: any) {
        // Table might not exist or might be empty, continue
        if (!error.message?.includes('does not exist')) {
          console.log(`Warning cleaning ${tableName}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
}

/**
 * Create test users in the database
 * @param dataSource TypeORM DataSource
 */
export async function createTestUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository('User');

  // Check if users already exist
  const existingAdmin = await userRepository.findOne({
    where: { id: TEST_USERS.admin.id },
  });
  const existingUser = await userRepository.findOne({
    where: { id: TEST_USERS.user.id },
  });

  // Hash passwords
  const adminHashedPassword = await bcrypt.hash(TEST_USERS.admin.password, 10);
  const userHashedPassword = await bcrypt.hash(TEST_USERS.user.password, 10);

  // Create admin user if not exists
  if (!existingAdmin) {
    await userRepository.save({
      id: TEST_USERS.admin.id,
      email: TEST_USERS.admin.email,
      password: adminHashedPassword,
      mobile: TEST_USERS.admin.mobile,
      name: TEST_USERS.admin.name,
      role: TEST_USERS.admin.role,
      is_verified: true,
    });
  }

  // Create regular user if not exists
  if (!existingUser) {
    await userRepository.save({
      id: TEST_USERS.user.id,
      email: TEST_USERS.user.email,
      password: userHashedPassword,
      mobile: TEST_USERS.user.mobile,
      name: TEST_USERS.user.name,
      role: TEST_USERS.user.role,
      is_verified: true,
    });
  }
}

/**
 * Create a test category
 * @param dataSource TypeORM DataSource
 * @param name Category name
 * @param parentId Optional parent category ID
 */
export async function createTestCategory(
  dataSource: DataSource,
  name: string,
  parentId?: string,
): Promise<any> {
  const categoryRepository = dataSource.getRepository('Category');

  const category = await categoryRepository.save({
    name,
    parent: parentId ? { id: parentId } : null,
  });

  return category;
}

/**
 * Create a test product
 * @param dataSource TypeORM DataSource
 * @param adminId Admin user ID
 * @param categoryId Category ID
 */
export async function createTestProduct(
  dataSource: DataSource,
  adminId: string,
  categoryId: string,
): Promise<any> {
  const productRepository = dataSource.getRepository('Product');

  const product = await productRepository.save({
    name: 'Test Product',
    description: 'Test product description',
    price: 99.99,
    sku: `SKU-${Date.now()}`,
    stock_qty: 100,
    status: 'INSTOCK',
    availability: 'INSTOCK',
    category: { id: categoryId },
    user: { id: adminId },
  });

  return product;
}

/**
 * Setup application for testing
 * @param app NestJS application
 */
import { ValidationPipe } from '@nestjs/common';

export function setupApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
}

/**
 * Mock guard that always allows access
 */
export const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

/**
 * Mock roles guard that always allows access
 */
export const mockRolesGuard = {
  canActivate: jest.fn(() => true),
};

/**
 * Create mock request with user
 */
export function createMockRequest(userId: string, role: string) {
  return {
    user: {
      id: userId,
      role: role,
    },
  };
}
