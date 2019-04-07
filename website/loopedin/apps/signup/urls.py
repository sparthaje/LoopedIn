from django.urls import path
from . import views

app_name = "testapp"
urlpatterns = [
    path(r'', views.signup, name="signup"),
    path(r'info', views.index, name="index"),
    path(r'congress', views.congress, name="congress"),
    path(r'topics', views.topics, name="topics"),
    path(r'confirm', views.confirm, name="confirm"),
    path(r'zip-handler', views.zip_handler, name="zip_handler"),
    path(r'user-handler', views.user_handler, name="user_handler"),
    path(r'topics-handler', views.topics_handler, name="topics_handler"),
    path(r'push-handler', views.push_handler, name="push_handler")
]
