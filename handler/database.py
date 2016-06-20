#!/usr/bin/env python
#coding=utf-8

from model.models import mysql_db
from tornado.web import RequestHandler
from tornado.websocket import WebSocketHandler

class PeeweeRequestHandler(RequestHandler):
    def prepare(self):
        mysql_db.connect()
        return super(PeeweeRequestHandler, self).prepare()

    def on_finish(self):
        if not mysql_db.is_closed():
            mysql_db.close()
        return super(PeeweeRequestHandler, self).on_finish()

class PeeweeWebSocketHandler(WebSocketHandler):
    def prepare(self):
        mysql_db.connect()
        return super(PeeweeWebSocketHandler, self).prepare()

    def on_finish(self):
        if not mysql_db.is_closed():
            mysql_db.close()
        return super(PeeweeWebSocketHandler, self).on_finish()

