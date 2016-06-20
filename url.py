#!/usr/bin/env python
#coding=utf-8
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

from handler import handlers

url=[
    (r'/', handlers.IndexHandler),
    (r'/main', handlers.MainHandler),
    (r'/websocket', handlers.SocketHandler),
    (r'/login', handlers.LoginHandler),
    (r'/signup', handlers.SignupHandler),
]
