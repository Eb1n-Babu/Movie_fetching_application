from django.contrib import admin
from django.urls import path
from .views import ConfigView, MovieView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/config/', ConfigView.as_view(), name='config'),
    path('api/movies/', MovieView.as_view(), name='movies'),
]