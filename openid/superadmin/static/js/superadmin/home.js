$(document).ready(function(){
    $("body").on('click', '.delete_user', function(){
        var token = $("input[name=csrfmiddlewaretoken]").val();
        var userid = $(this).attr('data-id');
        swal({
            title: 'Are you sure?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes!'
        }).then(function(result){
            if(result.value){
                $.ajax({
                    type:'POST',
                    url:location.href,
                    data: {'userid':userid, 'csrfmiddlewaretoken':token, 'active': 'delete_user'},
                    success: function(msg){
                        if ((msg == 'Please check again!') || (msg == 'Tên user không tồn tại!')){
                            swal({
                                type: 'error',
                                title: msg,
                            });
                        }else{
                            swal.close();
                            $("body .list_user_client").load(location.href + " .list_user_client");
                        }
                    }
                });
            }
        });
    });

    $("body").on('click', '.edit_user', function(){
        var userid = $(this).attr('data-id');
        $('body #title').html("Edit user: "+$("body #username"+userid).html());
        $("body input[name=fullname]").val($("body #fullname"+userid).html());
        $("body input[name=email]").val($("body #email"+userid).html());
        $("body input[name=phone]").val($("body #phone"+userid).html());
        $("#userid").text(userid);
    });


    $("body").on('click', '#edit_user_submit', function(){
        var token = $("input[name=csrfmiddlewaretoken]").val();
        var userid = $(this).next().text();
        var fullname = $("input[name=fullname]").val();
        var email = $("input[name=email]").val();
        var phone = $("input[name=phone]").val();
        $.ajax({
            type:'POST',
            url:location.href,
            data: {'userid': userid, 'csrfmiddlewaretoken':token, 'fullname': fullname, 'email': email, 'phone': phone, 'active': 'edit_user'},
            success: function(msg){
                if ((msg == 'Please check again!') || (msg == 'Tên user không tồn tại!')){
                    swal({
                        type: 'error',
                        title: msg,
                    });
                }else{
                    document.getElementById("close_modal").click();
                    $("body .list_user_client").load(location.href + " .list_user_client");
                }
            }
        });
    });
});