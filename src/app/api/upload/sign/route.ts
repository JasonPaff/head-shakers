import { CloudinaryService } from '@/lib/services/cloudinary.service';

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { paramsToSign } = body;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const signature = CloudinaryService.generateUploadSignature(paramsToSign);

  return Response.json({ signature });
}
