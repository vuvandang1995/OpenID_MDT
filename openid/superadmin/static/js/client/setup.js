$(document).ready(function () {
    // tạo sshkey
    $("body").on('click', '#sshkey_submit', function(){
        var token = $("input[name=csrfmiddlewaretoken]").val();
        var sshkeyname = $("input[name=sshkeyname]").val();
        swal({
            imageUrl: '/static/images/spinner.gif',
            imageHeight: 120,
            imageAlt: 'wait',
            title: "Xin chờ...",
            showConfirmButton: false
        });
        $.ajax({
            type:'POST',
            url:'/sshkeysa',
            data: {'sshkeyname':sshkeyname, 'csrfmiddlewaretoken':token},
            success: function(msg){
                if ((msg == 'Đã có lỗi xảy ra!') || (msg == 'Tên ssh key đã tồn tại!')){
                    swal({
                        type: 'error',
                        title: msg,
                    });
                }
                else if(msg.length > 100) {
                    location.replace = "/"
                }
                else{
                    document.getElementById("close_modal_sshkey").click();
                    swal.close();
                    $("#add_ssh_key").load("/sshkeysa");
                }
            }
        });
    });

    // tạo server
    $("#create_vm").click(function(){
        var token = $("input[name=csrfmiddlewaretoken]").val();
        var svname = $("input[name=svname]").val();
        if (svname == ''){
            swal({
                type: 'error',
                title: 'Lỗi',
                text: 'VM Hostname không được để trống'
            });
            return false;
        }

        // check điều khoản
        if(!$("input[name=dong_y]").is(":checked")){
            swal({
                type: 'error',
                title: 'Lỗi',
                text: 'Chưa đồng ý với điều khoản và chính sách bảo mật'
            });
            return false;
        }
        var data_center = $(".one-location.text-center.selected").data('location');

        var type_disk = 'ceph-sdd';

        var data_disk = [];
        $(".template_data_disk").each(function(){
            data_disk.push(parseInt($(this).find('.irs-single').first().text().split(" ")[0]));
        });

        // lấy image id
        var image;
        var os;
        if($("#oses .active").attr('href') == '#os-hdh'){
            $('.selected-os-hdh').each(function(){
                if($(this).parent().attr('class')=='btn one-dis-toggle'){
                    os = $(this).text();
                    return false;
                }
            });
            ck = false;
            $(".os-select").each(function(){
                if($(this).text() == os){
                    image = $(this).data('id')
                    ck = true;
                    return false;
                }
            })
            if(!ck){
                swal({
                    type: 'error',
                    title: 'Lỗi',
                    text: 'Chưa chọn hệ điều hành'
                });
                return false;
            }
        }else{
            os = 'snap'
            image = $("#ls_snapshot option:selected").val();
        }

        var vcpus = parseInt($('#cpu-slider').parent().find('.irs-single').first().text().split(" ")[0]);
        var ram = parseInt($('#ram-slider').parent().find('.irs-single').first().text().split(" ")[0]);
        var disk = parseInt($('#ssd-slider').parent().find('.irs-single').first().text().split(" ")[0]);

        // check cấu hình tạo server window
        if(os.toLocaleLowerCase().includes("windows")){
            if(ram<2 || vcpus<2 || disk<40){
                swal({
                    type: 'error',
                    title: 'Lỗi',
                    text: 'Cấu hình tối thiểu cho window là 2 core, 2GB ram, 40GB ssd'
                });
                return false;
            }
        }

        // check tài khoản dùng thử
        if(user_trial=="True"){
            if(ram>2 || vcpus>2 || disk>40){
                swal({
                    type: 'error',
                    title: 'Lỗi',
                    text: 'Tài khoản dùng thử chỉ được tạo máy chủ với cấu hình tối đa là 2 core, 2GB ram, 40GB ssd'
                });
                return false;
            }
            if(user_server > 0){
                swal({
                    type: 'error',
                    title: 'Lỗi',
                    text: 'Tài khoản dùng thử chỉ được tạo 1 máy chủ'
                });
                return false;
            }
        }else{
            var price = parseInt($(".total-price-with-vat").text());
            if(price > user_money){
                swal({
                    type: 'error',
                    title: 'Lỗi',
                    text: 'Không đủ tiền'
                });
                return false;
            }
        }

        var private_network = '0';
        if($('input[name=private_network]').is(":checked")){
            private_network = '1'
        }

        var sshkey = $("#add_ssh_key option:selected").text();

        swal({
            imageUrl: '/static/images/spinner.gif',
            imageHeight: 120,
            imageAlt: 'wait',
            title: "Xin chờ ...",
            showConfirmButton: false
        });
        $.ajax({
            type: 'POST',
            url: location.href,
            data: {
                csrfmiddlewaretoken:token,
                svname: svname,
                data_center: data_center,
                vcpus: vcpus,
                ram: ram,
                disk: disk,
                image: image,
                type_disk: type_disk,
                private_network: private_network,
                sshkey: sshkey,
                data_disk: JSON.stringify(data_disk),
            },
            success: function(data){
                if(data.length > 100) {
                    location.replace = "/"
                }
                var msg = JSON.parse(JSON.stringify(data));
                if (msg.status == 'Failure'){
                    swal({
                        type: 'error',
                        title: msg.message,
                    });
                }
                else{
                    setTimeout(function(){
                        swal({
                            type: 'success',
                            title: "Thành công",
                            showConfirmButton: false,
                            timer: 2000
                        });
                        opsSocket.send(JSON.stringify({
                            'message' : msg.message,
                        }));
                    }, 1000);
                }
            }
        });
    });
});