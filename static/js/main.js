/**
 *
 * Created by flyingkite on 6/13/16.
 */
$(function(){
    initSocket();
    //$("#add_group_btn").click(showAddGroup);
    $("#add_group").click(addFriendBtn);
    $("#hide_content_button").click(hideContentBox);
    $("#search_friend").click(searchFriend);
    $("#send_chat_btn").click(sendOneMessage)
});

function showAddGroup(user_id)
{
    $("#add_group_div").data("user_id",user_id);
    $("#add_group_div").show()
}

function addFriendBtn()
{
    addFriend();
    $("#add_group_div").hide()
}

function renderAllFriends()
{
    $("#friends_group").html("");
    $("#search_result_list").html("");
    $("#search_friend_name").val("");
    for(var key in info)
    {
        if(key!="type"&&key!="self_id")
            renderOneGroup(info[key])
    }
}

function renderOneGroup(group)
{
    var oneGroup=''+
        '<div class="collector_title friends" >'+
        '<img id="" src="/static/image/main/release.png"'+
        'style="cursor:pointer;height: 20px;float:left ;margin-left:  20px;margin-top: 10px;">'+
        '<span class="text">'+group.group_name+'</span>'+
        '</div>'+
        '<ul id="list_'+group.group_id+'" class="friends_ul">'+
        '</ul>';
    $("#friends_group").append(oneGroup);
    for(var key in group.group_members)
    {
        renderFriend(group.group_id,group.group_members[key])
    }
}

function renderFriend(group_id,friend)
{
    var oneFriend=''+
        '<li id="friend_'+friend.id+'" class="piece_box" onclick="showContentBox('+friend.id+')" data-nickname="'+friend.nickname+'">'+
        '<div class="piece_icon">'+
        '<img class="piece_url"'+
        'src="/static/image/avatar/'+friend.pic_id+'.jpg">'+
        '</div>'+
        '<div class="piece_info">'+
        '<span class="piece_name">'+friend.nickname+'</span>'+
        '<span class="piece_client png wp-none"></span>'+
        '<span class="piece_online png wp-none"></span>'+
        '</div>'+
        '</li>';
    $("#list_"+group_id).append(oneFriend)
}

function renderSearchResult() {
    $("#search_result_list").html("");
    var i=0;
    for(var key in search_info)
    {
        if(key!="type")
        {
            i=i+1;
            renderOneSearch(search_info[key])
        }
    }
    if(i==0)
    {
        renderNotFound()
    }
}

function renderOneSearch(user){
    var oneSearch=''+
        '<li id="search_show_'+user.id+'" class="piece_box">'+
        '<div class="piece_icon">'+
        '<img class="piece_url" src="/static/image/avatar/'+user.pic_id+'.jpg">'+
        '</div>'+
        '<div class="piece_info">'+
        '<span class="piece_name"></span>'+
        '<span id="search_show_id">'+user.nickname+'</span>'+
        '</div>'+
        '<img id="search_show_img_'+user.id+'" onclick="showAddGroup('+user.id+')" src="/static/image/main/add.png"'+
        'style="cursor:pointer;height: 30px;float: right;margin-right: 20px;margin-top: 20px;">'+
        '</li>';
    $("#search_result_list").append(oneSearch)

}

function renderNotFound() {
    var notFound=''+
        '<li id="search_show_not_found" class="piece_box">'+
        '<div class="piece_icon">'+
        '<img class="piece_url" src="/static/image/main/not_found.png">'+
        '</div>'+
        '<div class="piece_info">'+
        '<span class="piece_name"></span>'+
        '<span id="search_show_id">没找到好友呢</span>'+
        '</div>'+
        '</li>';
    $("#search_result_list").append(notFound)
}

function showContentBox(friend_id) {
    currentUser=friend_id;
    var friend_name=$("#friend_"+friend_id).attr("data-nickname");
    $("#recv_name").html(friend_name);
    getMessageById(friend_id);
    $("#content").show();
}

function hideContentBox()
{
    currentUser=null;
    $("#content").hide()
}

function renderAllMessage(message){
    $("#chat").html("");
    var num=message.messages.length;
    for(var i=0;i<num;i++)
    {
        renderOneMessage(message.messages[i],message.me.pic_id,message.other.pic_id);
    }
}

function renderOneMessage(message,me_pic,other_pic) {
    var oneMessage;
    if(message[1])
    {
        oneMessage=''+
            '<li id="chat_list_'+message[2]+'" class="me">'+ message[0] + '</li>';
        $("#chat").append(oneMessage);
        $("#chat_list_"+message[2]).addClass("avatar-"+me_pic)
    }
    else{
        oneMessage=''+
            '<li id="chat_list_'+message[2]+'" class="other">'+ message[0] + '</li>';
        $("#chat").append(oneMessage);
        $("#chat_list_"+message[2]).addClass("avatar-"+other_pic)
    }
}


function markOneFriendMessage(){

}

function cleanOneFriendMark(){

}
