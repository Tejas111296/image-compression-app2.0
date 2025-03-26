from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_image, name='upload_image'),
    path('download-compressed/', views.download_compressed_image, name='download_compressed_image'),
]
