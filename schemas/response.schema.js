import { z } from 'zod';

const ResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  nickname: z.string().min(1),
});

export default ResponseSchema;
