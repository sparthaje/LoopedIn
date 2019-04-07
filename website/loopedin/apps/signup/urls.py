from django.urls import path
from . import views

app_name="testapp"
urlpatterns = [
    path(r'', views.index, name="index"),
    path(r'zip-handler', views.zip_handler, name="zip_handler")
]