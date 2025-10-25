import { z } from 'zod';

const RequestSchema = z.object({
  roomId: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  nickname: z.string().min(1),
});

export type RequestData = z.infer<typeof RequestSchema>;

export default RequestSchema;
