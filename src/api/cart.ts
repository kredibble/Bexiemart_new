import client from './client';

export const addToCart = async (data: {
  productId: string;
  quantity: number;
}) => {
  const res = await client.post('/cart', data);
  return res.data;
};

export const getCart = async () => {
  const res = await client.get('/cart');
  return res.data;
};

export const removeFromCart = async (cartItemId: string) => {
  const res = await client.delete(`/cart/${cartItemId}`);
  return res.data;
};
