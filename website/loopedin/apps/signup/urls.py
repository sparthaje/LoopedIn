from django.urls import path
from . import views

app_name = "testapp"
urlpatterns = [
    path(r'', views.signup, name="signup"),
    path(r'info', views.index, name="index"),
    path(r'congress', views.congress, name="congress"),
    path(r'zip-handler', views.zip_handler, name="zip_handler"),
    path(r'user-handler', views.user_handler, name="user_handler")
]
