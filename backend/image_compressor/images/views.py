import boto3
import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # For development only. For production, handle CSRF properly.
def upload_image(request):
    if request.method == 'POST' and request.FILES.get('image'):
        # Get uploaded image
        image = request.FILES['image']
        image_name = image.name
        
        # Get compression level from frontend (default 'medium' if not sent)
        compression_level = request.POST.get('compression', 'medium')
        print(f"Received compression level: {compression_level}")

        # Upload to original S3 bucket
        s3_client = boto3.client('s3', region_name=settings.AWS_REGION_NAME)
        s3_client.upload_fileobj(image, settings.AWS_STORAGE_BUCKET_NAME, image_name)

        # Trigger Lambda with compression level
        lambda_client = boto3.client('lambda', region_name=settings.AWS_REGION_NAME)
        lambda_payload = {
            "bucket": settings.AWS_STORAGE_BUCKET_NAME,
            "key": image_name,
            "compression_level": compression_level  # Dynamically pass user's choice!
        }

        response = lambda_client.invoke(
            FunctionName='demo-image-resizer-lambda',  # Replace with your Lambda function name
            InvocationType='Event',  # Async
            Payload=json.dumps(lambda_payload)
        )
        print("Lambda invoked:", response)

        return JsonResponse({
            "message": f"Image uploaded with {compression_level} compression.",
            "image_url": f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{image_name}",
            "compression": compression_level
        })
    
    return JsonResponse({"message": "Failed to upload image."}, status=400)

@csrf_exempt
def download_compressed_image(request):
    if request.method == 'GET':
        image_name = request.GET.get('image_name')

        if not image_name:
            return JsonResponse({"message": "Image name required."}, status=400)

        s3_client = boto3.client('s3', region_name=settings.AWS_REGION_NAME)

        try:
            s3_client.head_object(
                Bucket=settings.COMPRESSED_BUCKET_NAME,
                Key=image_name
            )
        except Exception as e:
            print(f"File does not exist or wrong key: {e}")
            return JsonResponse({"message": "Compressed file not found."}, status=404)

        try:
            url = s3_client.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket': settings.COMPRESSED_BUCKET_NAME,
                    'Key': image_name
                },
                ExpiresIn=300
            )
            return JsonResponse({
                "message": "Compressed image ready.",
                "download_url": url
            })
        except Exception as e:
            print(f"Error generating pre-signed URL: {e}")
            return JsonResponse({"message": "Error generating download URL."}, status=500)

    return JsonResponse({"message": "Invalid request method."}, status=400)