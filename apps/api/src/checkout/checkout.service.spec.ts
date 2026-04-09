import { BadRequestException } from '@nestjs/common';
import { CheckoutService } from './checkout.service';

describe('CheckoutService', () => {
  it('throws when cart is empty', async () => {
    const service = new CheckoutService(
      {} as never,
      { getCart: jest.fn().mockResolvedValue({ items: [] }) } as never,
      {} as never,
    );
    await expect(
      service.initCheckout('user-id', { idempotencyKey: 'idem-key' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
