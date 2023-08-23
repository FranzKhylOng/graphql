import { faker } from '@faker-js/faker';
import { Product } from '../../src/libs/types';

export function generateProductDetails(
  params?: Partial<Omit<Product, 'owner'>>,
): Partial<Omit<Product, 'owner' | 'name' | 'description'>> &
  Pick<Product, 'name' | 'description'> {
  return {
    name: faker.commerce.product(),
    description: faker.commerce.productDescription(),
    ...(params || {}),
  };
}
