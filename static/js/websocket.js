/**
 * Created by flyingkite on 6/13/16.
 */

function initSocket(){
    var wsUri="ws://"+location.host+"/websocket"
    CreateWebsocket(wsUri)

}
function CreateWebsocket(wsUri){
    ws=new WebSocket(wsUri);
    ws.onopen=function()
    {
        getInit()
    };
    ws.onmessage=function(evt)
    {
        dealMsg(evt.data)
    };
    ws.onclose=function()
    {
        location="/"
    };
}

function addFriend(){
    var message={
        type:"add_friend",
        friend_id:$("#add_group_div").data("user_id"),
        group_name:$("#group_name").val()
    };
    var raw_data=JSON.stringify(message);
    ws.send(raw_data)
}

function getInit(){
    var message={
        type:"get_init_data"
    };
    var raw_data=JSON.stringify(message);
    ws.send(raw_data)
}

function searchFriend()
{
    var search_friend_name=$("#search_friend_name").val();
    if(search_friend_name.length!=0) {
        var message = {
            type: "search_friend",
            value: search_friend_name
        };
        var raw_data = JSON.stringify(message);
        ws.send(raw_data)
    }
    else
    {
        $("#search_result_list").html("")
    }
}

function getMessageById(friend_id)
{
    var message={
        type:"get_message_by_id",
        friend_id:friend_id
    };
    var raw_data=JSON.stringify(message);
    ws.send(raw_data)
}

function sendOneMessage(){
    var content=$("#chat_textarea").val();
    if(content.length!=0)
    {
        var message={
            type:"send_one_message",
            friend_id:currentUser,
            content:content
        };
        var raw_data=JSON.stringify(message);
        ws.send(raw_data);
        $("#chat_textarea").val("")
    }
}

function deleteFriend(friend_id){
    var message={
        type:"delete_friend",
        friend_id:friend_id,
        group_id: $("#friend_"+friend_id).attr("data-groupid")
    };
    var raw_data=JSON.stringify(message);
    ws.send(raw_data);
}

function dealMsg(raw_data){
    message=JSON.parse(raw_data);
    if(message.type=="get_init_data")
    {
        info=message;
        renderAllFriends();
    }
    else if(message.type=="search_friend")
    {
        search_info=message;
        renderSearchResult()
    }
    else if(message.type=="add_friend")
    {
        getInit()
    }
    else if(message.type=="delete_friend")
    {
        getInit()
    }
    else if(message.type=="get_message_by_id")
    {
        renderAllMessage(message)
    }
    else if(message.type=="send_one_message")
    {
        if(info.self_id==message.from_id)
        {
            if(message.to_id==currentUser) {
                new_message = new Array();
                new_message.push(message.content);
                new_message.push(1);
                new_message.push(message.um_id);
                renderOneMessage(new_message, message.from_pic, message.to_pic)
            }
        }
        else
        {
            if(message.from_id==currentUser) {
                new_message = new Array();
                new_message.push(message.content);
                new_message.push(0);
                new_message.push(message.um_id);
                renderOneMessage(new_message, message.to_pic, message.from_pic)
            }
        }
    }
}


