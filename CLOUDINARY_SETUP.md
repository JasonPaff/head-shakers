# Cloudinary Upload Preset Configuration

## Required Upload Presets

You need to create these upload presets in your Cloudinary console:

### 1. `bobblehead-photos` (Signed Upload)

**Settings:**
- **Signing Mode**: Signed
- **Folder**: `users/{userId}/temp`
- **Resource Type**: Image
- **Allowed Formats**: jpg, jpeg, png, webp, heic
- **Max File Size**: 10485760 (10MB)
- **Max Image Width**: 4000
- **Max Image Height**: 4000
- **Min Image Width**: 800
- **Min Image Height**: 600
- **Auto Tagging**: bobblehead, {userId}, timestamp
- **Overwrite**: false
- **Unique Filename**: true

**Transformations (Eager):**
- Thumbnail: `w_150,h_150,c_fill,g_face,f_auto,q_auto`
- Preview: `w_400,h_300,c_fill,g_auto,f_auto,q_auto`
- Gallery: `w_800,h_600,c_fit,f_auto,q_auto`

**Advanced:**
- **Use Filename**: true
- **Unique Filename**: true
- **Auto Backup**: true
- **Notification URL**: (optional - for webhooks)

### 2. `bobblehead-photos-final` (For production move)

**Settings:**
- **Signing Mode**: Signed
- **Folder**: `users/{userId}/collections/{collectionId}/bobbleheads/{bobbleheadId}`
- **Overwrite**: false
- **Use Filename**: false
- **Public ID**: Use structured naming

## Environment Variables Required

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=bobblehead-photos
```

## Security Notes

- Upload preset is signed for security
- Temporary folder used initially
- Files moved to permanent location after bobblehead creation
- Auto-tagging for easy management
- File size and format restrictions enforced