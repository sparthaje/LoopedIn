from django.shortcuts import render, HttpResponse, HttpResponseRedirect, reverse

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login

import requests as pyreq

import json

import twitter

import random


def get_statuses(handle, name):
    api = twitter.Api(consumer_key='BrnetNOFaxbX6BBUP3Wo5TxQP',
                      consumer_secret='Ad2595WWCX3Pku0XmuWTayGMIbvB6ybz5FtaF8HR73Blv1mXWf',
                      access_token_key='863915107327332352-ePJUbRQ5PXbIBOh8b85H65kyRVESeOM',
                      access_token_secret='O4QB85msD0bBcojnA8rKwKIbhX6QGONo3ZLt3u3OpY15f')
    statuses = api.GetUserTimeline(screen_name=handle)
    return [(name, s.text) for s in statuses]


def index(request):
    return render(request, 'signup/index.html')


def home(request):
    return render(request, 'signup/home.html')


def signin(request):
    return render(request, 'signup/signin.html')


def signup(request):
    return render(request, 'signup/signup.html')


def topics(request):
    tpcs = ["Immigration", "Medicare", "Abortion", "Police", "Drugs", "Trade",
            "Climate", "Terrorism", "Education"]

    context = {
        "TOPICS": tpcs,
    }

    return render(request, 'signup/topics.html', context=context)


def confirm(request):
    state = request.session.get("state")
    zipcode = request.session.get("zipcode")
    response = request.session.get("response")
    topics = request.session.get("topics")

    context = {
        "NAME": request.user.username,
        "STATE": state,
        "ZIPCODE": zipcode,
        "REP": response["Representatives"][0]["name"],
        "SEN_1": response["Senators"][0]["name"],
        "SEN_2": response["Senators"][1]["name"],
        "TOPICS": str(topics).replace('\'', '').replace('[', '').replace(']', '')
    }

    return render(request, "signup/confirm.html", context=context)


def congress(request):
    response = request.session.get("response")

    context = {
        "REP_NAME": response["Representatives"][0]["name"],
        "REP_PARTY": response["Representatives"][0]["position"],
        "REP_PHOTO": response["Representatives"][0]["photoURL"],
        "REP_WEBSITE": response["Representatives"][0]["web"],
        "SEN_1_NAME": response["Senators"][0]["name"],
        "SEN_1_PARTY": response["Senators"][0]["position"],
        "SEN_1_PHOTO": response["Senators"][0]["photoURL"],
        "SEN_1_WEBSITE": response["Senators"][0]["web"],
        "SEN_2_NAME": response["Senators"][1]["name"],
        "SEN_2_PARTY": response["Senators"][1]["position"],
        "SEN_2_PHOTO": response["Senators"][1]["photoURL"],
        "SEN_2_WEBSITE": response["Senators"][1]["web"],
    }

    if context["REP_PHOTO"] is "":
        context["REP_PHOTO"] = "https://www.r-users.com/wp-content/plugins/all-in-" \
                               "one-seo-pack/images/default-user-image.png"

    if context["SEN_1_PHOTO"] is "":
        context["SEN_1_PHOTO"] = "https://www.r-users.com/wp-content/plugins/all-" \
                                 "in-one-seo-pack/images/default-user-image.png"

    if context["SEN_2_PHOTO"] is "":
        context["SEN_2_PHOTO"] = "https://www.r-users.com/wp-content/plugins/all-in-" \
                                 "one-seo-pack/images/default-user-image.png"

    return render(request, 'signup/congress.html', context=context)


def zip_handler(request):
    state = request.POST["state"]
    zipcode = request.POST["zipcode"]
    response = pyreq.post('https://loopedin-backend.herokuapp.com/reps',
                          data={"state": state, "zip": zipcode})

    request.session['state'] = state
    request.session['zipcode'] = zipcode

    f = open('file.txt', 'w')
    f.write(response.text)
    f.close()

    data = json.load(open('file.txt', 'r'))

    request.session['response'] = data

    return HttpResponseRedirect("/congress")


def user_handler(request):
    username, password = request.POST["username"], request.POST["password"]
    email = request.POST["username"] + "@gmail.com"
    new_user = User.objects.create_user(username=username, password=password, email=email)
    new_user.save()
    login(request, new_user)
    authenticate(request, username=username, password=password)
    return HttpResponseRedirect("/info")


def dashboard(request):
    try:
        username, password = request.POST["username"], request.POST["password"]
        user = authenticate(request, username=username, password=password)
    except:
        username = request.user.username
        pass

    state = request.session.get("state")
    zipcode = int(request.session.get("zipcode"))
    response = request.session.get("response")
    topics = request.session.get("topics")

    rep = response["Representatives"][0]["name"]
    repPos = response["Representatives"][0]["position"]
    sen1 = response["Senators"][0]["name"]
    sen1Pos = response["Representatives"][0]["position"]
    sen2 = response["Senators"][1]["name"]
    sen2Pos = response["Representatives"][0]["position"]

    totalTweets = []

    try:
        statusesR = get_statuses(response["Representatives"][0]["social"]['TWITTER'], rep)
        totalTweets.extend(statusesR)
    except:
        pass

    try:
        statusesS1 = get_statuses(response["Senators"][0]["social"]['TWITTER'], sen1)
        totalTweets.extend(statusesS1)
    except:
        pass

    try:
        statusesS2 = get_statuses(response["Senators"][1]["social"]['TWITTER'], sen2)
        totalTweets.extend(statusesS2)
    except:
        pass

    random.shuffle(totalTweets)

    context = {
        "STATE": state,
        "ZIPCODE": zipcode,
        'USERNAME': username,
        "REP": rep,
        "REP_PARTY": repPos,
        "SEN1": sen1,
        "SEN1_PARTY": sen1Pos,
        "SEN2": sen2,
        "SEN2_PARTY": sen2Pos,
        "TOPICS": topics,
        "TWEETS": totalTweets,
    }

    return render(request, 'signup/landing.html', context=context)


def topics_handler(request):
    topics = []
    z = 0
    for i in list(request.POST.items()):
        if not z == 0:
            topics.append(i[0])
        z += 1

    request.session['topics'] = topics
    return HttpResponseRedirect("/confirm")


def push_handler(request):
    name = request.user.username
    state = request.session.get("state")
    zipcode = int(request.session.get("zipcode"))
    response = request.session.get("response")
    topics = request.session.get("topics")

    rep = response["Representatives"][0]["name"]
    repPos = response["Representatives"][0]["position"]
    sen1 = response["Senators"][0]["name"]
    sen1Pos = response["Representatives"][0]["position"]
    sen2 = response["Senators"][1]["name"]
    sen2Pos = response["Representatives"][0]["position"]

    response = pyreq.post('https://loopedin-backend.herokuapp.com/upload',
                          data={"name": name, "state": state, "zip": zipcode,
                                "rep": rep, "reppos": repPos, "sen1": sen1,
                                "sen1pos": sen1Pos, "sen2": sen2, "sen2pos": sen2Pos,
                                "topics": [topics[0], topics[1], topics[2]]
                                })

    return HttpResponseRedirect("/dashboard")
