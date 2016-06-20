#!/usr/bin/env python
# coding=utf-8

import tornado.web
import tornado.websocket
import sys
import json
from model.models import *
import datetime

reload(sys)
sys.setdefaultencoding('utf-8')


class BaseHandler(tornado.web.RequestHandler):

    def get_current_user(self):
        return self.get_secure_cookie("user_id")


class IndexHandler(BaseHandler):

    def get(self):
        if self.get_secure_cookie("user_id") is not None:
            self.clear_cookie("user_id")
        self.render("sign.html")


class MainHandler(BaseHandler):

    @tornado.web.authenticated
    def get(self):
        self.render("main.html")


class LoginHandler(BaseHandler):

    def post(self):
        ret = dict()
        nickname = self.get_argument("login_name")
        password = self.get_argument("login_password")
        userlist = User.select().where(
            User.nickname == nickname,
            User.password == password)
        if len(userlist) == 1:
            ret["result"] = "success"
            self.set_secure_cookie("user_id", str(userlist[0].id))
        else:
            ret["result"] = "fail"
        self.write(json.dumps(ret))


class SignupHandler(BaseHandler):

    def post(self):
        ret = dict()
        nickname = self.get_argument("nickname")
        email = self.get_argument("email")
        password = self.get_argument("password")
        pic_id = self.get_argument("pic_id")
        if len(User.select().where(User.nickname == nickname)):
            ret["result"] = "dup_nickname"
            self.write(json.dumps(ret))
            return
        if len(User.select().where(User.email == email)):
            ret["result"] = "dup_email"
            self.write(json.dumps(ret))
            return
        try:
            user = User()
            user.nickname = nickname
            user.email = email
            user.password = password
            user.pic_id = pic_id
            user.save()
            referenceGroup = ReferenceGroup()
            referenceGroup.name = "默认分组"
            referenceGroup.user = user
            referenceGroup.save()
            ret["result"] = "success"
        except Exception as e:
            print(e)
            ret["result"] = "insert_fail"
        if ret["result"] == "success":
            self.set_secure_cookie("user_id", str(user.id))
        self.write(json.dumps(ret))


class SocketHandler(tornado.websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self):
        self.user_id = int(self.get_secure_cookie("user_id"))
        dup = self.application.socketList.getOneUserById(self.user_id)
        if dup is not None:
            dup.close()
        self.application.socketList.register(self)

    def on_close(self):
        self.application.socketList.unregister(self)

    def on_message(self, raw_data):
        message = json.loads(raw_data)
        ret = dict()
        if message["type"] == "get_init_data":
            ret["type"] = message['type']
            ret["self_id"] = self.user_id
            me = User.select().where(User.id == self.user_id).get()
            rgs = ReferenceGroup.select().where(ReferenceGroup.user == me)
            for rg in rgs:
                ret[rg.id] = dict()
                ret[rg.id]["group_id"] = rg.id
                ret[rg.id]["group_name"] = rg.name
                ret[rg.id]["group_members"] = dict()
                members = Reference.select().where(Reference.group == rg)
                for member in members:
                    ret[rg.id]["group_members"][member.friend_user.id] = dict()
                    ret[rg.id]["group_members"][member.friend_user.id][
                        "id"] = member.friend_user.id
                    ret[rg.id]["group_members"][member.friend_user.id][
                        "nickname"] = member.friend_user.nickname
                    ret[rg.id]["group_members"][member.friend_user.id][
                        "pic_id"] = member.friend_user.pic_id
        elif message["type"] == "search_friend":
            ret["type"] = message['type']
            me = User.select().where(User.id == self.user_id).get()
            rgs = ReferenceGroup.select().where(ReferenceGroup.user == me)
            friends_id_list = list()
            for rg in rgs:
                friends = Reference.select().where(Reference.group == rg)
                friends_id_list = friends_id_list + \
                    [friend.friend_user.id for friend in friends]
            users = User.select().where(
                User.nickname.contains(
                    message['value']))
            for user in users:
                if (user.id not in friends_id_list) and (user.id != self.user_id):
                    ret[user.id] = dict()
                    ret[user.id]["id"] = user.id
                    ret[user.id]["nickname"] = user.nickname
                    ret[user.id]["pic_id"] = user.pic_id
        elif message["type"] == "add_friend":
            ret["type"] = message['type']
            me = User.select().where(User.id == self.user_id).get()
            groups = ReferenceGroup.select().where(
                ReferenceGroup.user == me,
                ReferenceGroup.name == message["group_name"])
            if not len(groups):
                rg = ReferenceGroup()
                rg.name = message["group_name"]
                rg.user = User.select().where(User.id == self.user_id).get()
                rg.save()
                friend = Reference()
                friend.group = rg
                friend.friend_user = User.select().where(
                    User.id == message["friend_id"]).get()
                friend.accept_time = datetime.datetime.now().strftime("%y-%m-%d %H:%M:%S")
                friend.save()
            else:
                rg = groups[0]
                friend = Reference()
                friend.group = rg
                friend.friend_user = User.select().where(
                    User.id == message["friend_id"]).get()
                friend.accept_time = datetime.datetime.now().strftime("%y-%m-%d %H:%M:%S")
                friend.save()
            bi = Reference()
            other = User.select().where(User.id == message["friend_id"]).get()
            bi.group = ReferenceGroup.select().where(
                ReferenceGroup.user == other,
                ReferenceGroup.name == "默认分组").get()
            bi.friend_user = User.select().where(User.id == self.user_id).get()
            bi.accept_time = datetime.datetime.now().strftime("%y-%m-%d %H:%M:%S")
            bi.save()
            other_socket = self.application.socketList.getOneUserById(message[
                                                                      "friend_id"])
            if other_socket is not None:
                other_socket.write_message(json.dumps(ret))
        elif message['type'] == "get_message_by_id":
            ret["type"] = message['type']
            me = User.select().where(User.id == self.user_id).get()
            other = User.select().where(User.id == message["friend_id"]).get()
            messages = UserMessage.select().where(
                ((UserMessage.from_user == me) & (
                    UserMessage.to_user == other)) | (
                    (UserMessage.from_user == other) & (
                        UserMessage.to_user == me))).order_by(UserMessage.send_time.asc())
            ret["me"]=dict()
            ret["me"]["id"]=me.id
            ret["me"]["nickname"]=me.nickname
            ret["me"]["pic_id"]=me.pic_id
            ret["other"]=dict()
            ret["other"]["id"]=other.id
            ret["other"]["nickname"]=other.nickname
            ret["other"]["pic_id"]=other.pic_id

            ret["messages"]=list()

            for message in messages:
                if message.from_user==me:
                    ret["messages"].append([message.content,1,message.id])
                else:
                    ret["messages"].append([message.content,0,message.id])
        elif message['type'] == "send_one_message":
            ret["type"] = message['type']
            me = User.select().where(User.id == self.user_id).get()
            other = User.select().where(User.id == message["friend_id"]).get()
            um=UserMessage()
            um.from_user=me
            um.to_user=other
            um.send_time=datetime.datetime.now().strftime("%y-%m-%d %H:%M:%S")
            um.content=message["content"]
            um.save()
            ret["from_id"]=me.id
            ret["from_pic"]=me.pic_id
            ret["to_id"]=other.id
            ret["to_pic"]=other.pic_id
            ret["content"]=message["content"]
            ret["um_id"]=um.id
            other_socket = self.application.socketList.getOneUserById(message[
                                                                          "friend_id"])
            if other_socket is not None:
                other_socket.write_message(json.dumps(ret))
        self.write_message(json.dumps(ret))


class SocketList(object):

    def __init__(self):
        self.list = list()

    def register(self, newSock):
        self.list.append(newSock)

    def unregister(self, deleteSock):
        self.list.remove(deleteSock)

    def getOneUserById(self, user_id):
        for user in self.list:
            if user.user_id == user_id:
                return user
        return None
