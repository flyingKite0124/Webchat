from peewee import *
from playhouse.db_url import connect

mysql_db=MySQLDatabase("webchat",host="localhost",port=3306,user="webchat",passwd="Webchat_123")

class BaseModel(Model):
    class Meta:
        database=mysql_db

class User(BaseModel):
    nickname=CharField(max_length=40)
    email=CharField(max_length=40)
    password=CharField(max_length=32)
    pic_id=IntegerField()
    # status=IntegerField()

class UserMessage(BaseModel):
    # type=IntegerField()
    content=TextField()
    send_time=DateTimeField()
    # is_read=BooleanField()
    to_user=ForeignKeyField(User,related_name="recv_msg")
    from_user=ForeignKeyField(User,related_name="send_msg")

class ReferenceGroup(BaseModel):
    name=CharField(max_length=40)
    user=ForeignKeyField(User)

class Reference(BaseModel):
    group=ForeignKeyField(ReferenceGroup)
    friend_user=ForeignKeyField(User,"friend")
    accept_time=DateTimeField()
    is_offine=BooleanField(default=False)


# class Group(BaseModel):
#     create_time=DateField()
#     introduction=TextField()
#     name=CharField(40)
#     pic_id=IntegerField()
#
# class GroupMember(BaseModel):
#     group=ForeignKeyField(Group)
#     user=ForeignKeyField(User)
#     join_time=DateField()
#
# class GroupMessage(BaseModel):
#     type=IntegerField()
#     content=TextField()
#     send_time=DateTimeField()
#     group=ForeignKeyField(Group)
#     from_user=ForeignKeyField(User)

if __name__ == '__main__':
    mysql_db.create_tables([User,UserMessage,Reference,ReferenceGroup])
