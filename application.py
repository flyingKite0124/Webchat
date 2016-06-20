#!/usr/bin/env python
#coding=utf-8
from url import url
import tornado.web
import os
import model.models
import handler.handlers


class Application(tornado.web.Application):
    def __init__(self):
        self.db=model.models.mysql_db
        self.db.connect()

        self.socketList=handler.handlers.SocketList()

        self.settings=dict(
            template_path=os.path.join(os.path.dirname(__file__),"template"),
            static_path=os.path.join(os.path.dirname(__file__),"static"),
            cookie_secret='t4/S/g+WRNC+2ffVy2rED8aInY/eRUKUjnAHau8rMbY=',
            # xsrf_cookies=True,
            login_url="/",
        )
        self.handlers=url
        tornado.web.Application.__init__(self,self.handlers,**self.settings)


application=Application()