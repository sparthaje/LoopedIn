from django.shortcuts import render, HttpResponse

zipcode = 0

def index(request):
    print(zipcode)
    return render(request, 'signup/index.html')


def zip_handler(request):
    global zipcode
    zipcode = int(request.POST["zipcode"])
    return HttpResponse("h")
