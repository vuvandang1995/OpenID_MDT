$(document).ready(function(){
    // thay đổi mật khẩu
    $("#change").click(function(){
        var pass1 = $("input[name=pass1]").val();
        var pass2 = $("input[name=pass2]").val();
        var pass3 = $("input[name=pass3]").val();

        if( pass1=='' || pass2=='' || pass3==''){
            Swal.fire({
                type: 'error',
                title: 'Error',
                text: 'Please fill out this field'
            })
            return false;
        }

        if(pass2!=pass3){
            Swal.fire({
                type: 'error',
                title: 'Error',
                text: "Password doesn't match"
            })
            return false;
        }
        swal({
                imageUrl: '/static/images/spinner.gif',
                imageHeight: 120,
                imageAlt: 'wait',
                title: "Waiting ...",
                showConfirmButton: false
            });
        $.ajax({
            type: 'POST',
            url: location.href,
            data: {
                csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
                pass1: pass1,
                pass2: pass2
            },
            success: function(msg){
                swal.close();

                var result = JSON.parse(JSON.stringify(msg));

                if(result.status == 'Fail'){
                    Swal.fire({
                        type: 'error',
                        title: 'Error',
                        text: result.messages,
                    });
                }
                else{
                    Swal.fire({
                        type: 'success',
                        title: 'Success!',
                        text: 'Back to login',
                        showConfirmButton: false,
                        timer: 2000
                    }).then(() => {
                        location.replace(result.messages)
                    });
                };
            }

        })
    })
});