import { eventHandler, getQuery } from 'h3';
import { optionalAuth } from '../middleware/auth';
import { success } from '../utils/response';

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  rating: number;
}

const services: Service[] = [
  { id: 's1', name: 'Wash & Fold Laundry', description: 'Same-day pick-up and delivery', price: 'GH₵ 50.00', image: 'https://images.unsplash.com/photo-1545173168-9fcf7c0fd8e3?w=400&q=80', category: 'laundry', rating: 4.5 },
  { id: 's2', name: 'B/W Printing', description: 'Per page — campus pickup', price: 'GH₵ 0.50/pg', image: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=400&q=80', category: 'printing', rating: 4.2 },
  { id: 's3', name: 'Color Printing', description: 'High-quality color prints', price: 'GH₵ 2.00/pg', image: 'https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=400&q=80', category: 'printing', rating: 4.0 },
  { id: 's4', name: 'Math Tutoring', description: '100-level to 400-level', price: 'GH₵ 80.00/hr', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80', category: 'tutoring', rating: 4.8 },
  { id: 's5', name: 'Phone Repairs', description: 'Screen, battery, charging port', price: 'From GH₵ 100', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80', category: 'repairs', rating: 4.3 },
  { id: 's6', name: 'Campus Delivery', description: 'Package delivery across campus', price: 'GH₵ 15.00', image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=400&q=80', category: 'logistics', rating: 4.6 },
  { id: 's7', name: 'Dry Cleaning', description: 'Suits, gowns, formal wear', price: 'GH₵ 60.00', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&q=80', category: 'laundry', rating: 4.4 },
  { id: 's8', name: 'Laptop Repairs', description: 'Hardware & software diagnosis', price: 'From GH₵ 150', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80', category: 'repairs', rating: 4.1 },
];

export const getServices = eventHandler(async (event) => {
  await optionalAuth(event);
  const query = getQuery(event);

  let filtered = [...services];

  if (query.category && typeof query.category === 'string') {
    filtered = filtered.filter((s) => s.category === query.category);
  }

  if (query.search && typeof query.search === 'string') {
    const q = query.search.toLowerCase();
    filtered = filtered.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    );
  }

  return success(filtered);
});

export const getServiceById = eventHandler(async (_event) => {
  // Stub — returns full service list; real implementation would filter by ID
  return success(services[0]);
});
