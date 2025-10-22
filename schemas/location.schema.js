import { z } from 'zod';

const LocationMessageSchema = z.object({
  room: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  nickname: z.string().min(1),
});

export default { LocationMessageSchema };
