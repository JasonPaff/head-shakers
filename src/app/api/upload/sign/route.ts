/* eslint-disable @typescript-eslint/no-unsafe-assignment  */
/* eslint-disable @typescript-eslint/no-unsafe-argument  */
import { CloudinaryService } from '@/lib/services/cloudinary.service';

export async function POST(request: Request) {
  const body = await request.json();
  const { paramsToSign } = body;

  const signature = CloudinaryService.generateUploadSignature(paramsToSign);

  return Response.json({ signature });
}
