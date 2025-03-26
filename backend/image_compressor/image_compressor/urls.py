from django.contrib import admin
from django.urls import path, include
from images import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('images.urls')),# Added by tejas
   #path('download-compressed/', views.download_compressed_image, name='download_compressed_image'),# Added by tejas
]
