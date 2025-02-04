var model={
    orgId:null,
    pro:null,
    isbind:false
};
var prefix = "/biz/dogInfo";
$(function() {


    load();
    //模糊查询
    $("#ss").click(function(){
        reLoad();
    });
    //keydowm事件
    $("#so").keydown(function(e) {
        if (e.keyCode == 13) {
            reLoad();
        }
    });

    initOrgSelect();
    initPro();

});




function change(e) {
    if(e==0){
        e=null;
    }
    return e;
}

//初始化组织选择框
function initOrgSelect(){
    $('#orgSelect').combotree({
        url: '/biz/orgInfo/initOrgSelect2',
        method:'get',
        required: false,
        valueField:'id',
        textField:'text',
        width:'260px',
        height:'38px',
        panelWidth:260,
        onSelect:function (data) {
        //刷新列表
            // data.id 组织id
            model.orgId=data.id;
            reLoad();
        },
        onLoadSuccess:function(node,data){
            $("#orgSelect").combotree('setValue',data[0].text);
        }
    });
}


function initPro(){
    $('#proSelect').combotree({
        url: '/biz/dogInfo/findProtector2',
        method:'get',
        required: false,
        valueField:'id',
        textField:'text',
        width:'220px',
        height:'38px',
        panelWidth:220,
        onSelect:function (data) {
            model.pro=data.id;
            reLoad();
        }, onLoadSuccess:function(node,data){
            $("#proSelect").combotree('setValue',data[0].text);
        }
    });
}


function load() {
    $('#dogMasterFileTable')
        .bootstrapTable(
            {
                method : 'get', // 服务器数据的请求方式 get or post
                url : prefix+"/findAll", // 服务器数据的加载地址
                //	showRefresh : true,
                //	showToggle : true,
                //	showColumns : true,
                iconSize : 'outline',
                //toolbar : '#exampleToolbar',
                striped : true, // 设置为true会有隔行变色效果
                dataType : "json", // 服务器返回的数据类型
                pagination : true, // 设置为true会在底部显示分页条
                // queryParamsType : "limit",
                // //设置为limit则会发送符合RESTFull格式的参数
                singleSelect : false, // 设置为true将禁止多选
                // contentType : "application/x-www-form-urlencoded",
                // //发送到服务器的数据编码类型
                pageSize : 10, // 如果设置了分页，每页数据条数
                pageNumber : 1, // 如果设置了分布，首页页码
                //search : true, // 是否显示搜索框
                showColumns : false, // 是否显示内容下拉框（选择显示的列）
                sidePagination : "server", // 设置在哪里进行分页，可选值为"client" 或者 "server"
                queryParams : function(params) {
                        //说明：传入后台的参数包括offset开始索引，limit步长，sort排序列，order：desc或者,以及所有列的键值对
                        return{
                            pageSize: params.limit,   //页面大小
                            pageNum: (params.offset/params.limit)+1,  //页码
                            orgId:model.orgId,
                            protector:change(model.pro),
                            string : $.trim($('#inputStr').val())
                        }
                },
                columns: [ {
                    field: 'dogSmallUrl',
                    //title: '照片',
                    title:dogPhoto,
                    align:'center',
                    valign:"middle",
                    formatter:function (value,row) {
                        var img='<img onclick="javascript:openImgShow(&quot;'+row.dogBigUrl+'&quot;);" src="'+value+'" alt="" />';
                        return  img;
                    }
                }, {
                    field: 'traceId',
                    title: traceId5,
                    align:'center',
                    valign:"middle"
                },{
                    field: 'deviceNo',
                    title: deviceNo5,
                    align:'center',
                    valign:"middle",
                    formatter:function (value) {
                        if(value==null){
                            var a='<foot style="color: red;">'+unBind+'</foot>';
                            return a;
                        }
                        return value;
                    }
                },{
                    field: 'dogName',
                    title: dogName5,
                    align:'center',
                    valign:"middle"
                },{
                    field: 'ownerName',
                    title: ownerName5,
                    align:'center',
                    valign:"middle"
                }, {
                    field: 'ownerPhone',
                    title: phone5,
                    align:'center',
                    valign:"middle"
                },{
                    field: 'town',
                    title: town5,
                    align:'center',
                    valign:"middle"
                }, {
                    field: 'address',
                    title: address5,
                    align:'center',
                    valign:"middle",
                    formatter:function (value,row) {
                        return  row.pname+row.no;
                    }
                },  {
                    field: 'createDate',
                    title: enterTime5,
                    align:'center',
                    valign:"middle",
                    formatter:function (value) {
                        return  timeStamp2String(value);
                    }
                }, {
                        title : operation5,
                        field : 'id',
                        align : 'center',
                        formatter : function(value, row, index) {
                            var c = '<a class="btn btn-warning btn-sm '+bind1+'" href="#" mce_href="#" onclick="bind(\''
                                + row.traceId
                                + '\')"><i class="fa"></i>'+bind5+'</a> ';
                            var f = '<a class="btn btn-success btn-sm '+check1+'" href="#" mce_href="#" title="查看" onclick="check(\''
                                + row.traceId
                                + '\')"><i class="fa"></i>'+detail5+'</a> ';
                            var e = '<a class="btn btn-info btn-sm '+edit1+'" href="#" mce_href="#" title="修改" onclick="edit(\''
                                + row.traceId
                                + '\')"><i class="fa"></i>'+edit5+'</a> ';
                            var d = '<a class="btn btn-warning btn-sm '+remove1+'" href="#" title="删除"  mce_href="#" onclick="remove(\''
                                + row.id
                                + '\')"><i class="fa"></i>'+delete5+'</a> ';
                            var a='<div style="height: 3px"></div>';
                            var g = '<a class="btn btn-primary btn-sm '+ownerChange1+'" href="#" title="犬主更换"  mce_href="#" onclick="ownerChange(\''
                                + row.traceId+','+row.owner+","+row.ownerName
                                + '\')"><i class="fa"></i>'+ownerChange5+'</a> ';
                            var h = '<a class="btn btn-warning btn-sm '+netletChange1+'" href="#" title="项圈更换"  mce_href="#" onclick="netletChange(\''
                                +  row.traceId
                                + '\')"><i class="fa"></i>'+netletChange5+'</a> ';
                            if(row.deviceNo==null){
                                return f+e+c;
                            }
                            return f+e+h;
                        }
                    }],
                responseHandler:function(result){ //格式化数据
                    if(result.data!=null){
                        return {
                            total : result.data.total, //总页数,前面的key必须为"total"
                            rows : result.data.list //行数据，前面的key要与之前设置的dataField的值一致.
                        };
                    }else{
                        return {
                            total : 0,
                            rows : []
                        };
                    }
                },
            });
}
function reLoad() {
    $('#dogMasterFileTable').bootstrapTable('destroy');
    load();
}
//查询详情
function check(traceId) {
    window.location=prefix+"/findOne?traceId="+traceId+"";
}

//跳到编辑页面
function edit(traceId) {
   window.location=prefix+"/editDog?traceId="+traceId+"";
}
function remove(Id) {
    layer.confirm(sureDeleteSelectedRecord, {
        btn : [ sure5, cancel5 ]
    }, function() {
        $.ajax({
            url : prefix + "/delete",
            type : "get",
            data : {
                'DogId' : Id
            },
            success : function(res) {
                if (res.status ==200) {
                    layer.msg(deleteSuccess);
                    reLoad();
                } else {
                    layer.msg(delteFail);
                }
            }
        });
    })
}

//绑定项圈
function bind(traceId) {

    layer.open({
        id:1,
        type: 1,
        title:bindDevice,
        skin:'layui-layer-rim',
        area:['450px', 'auto'],
        content: ' <div class="row" style="width: 420px;  margin-left:7px; margin-top:10px;">'
        +'<div class="col-sm-12">'
        +'<div class="input-group">'
        +'<span class="input-group-addon">'+neckLet5+' :</span>'
        +'<input id="deviceNo" type="text" class="form-control" onblur="getDeviceNo(this)" placeholder='+pleaseInputNecklet+'>'
        +'</div>'
        +'</div>'
        +'</div>'
        ,
        btn:[save5,cancel5],
        btn1: function (index,layero) {
            if($.trim($("#deviceNo").val())==''){
                layer.msg(pleaseInputNecklet);
                return false;
            }
            getDeviceNo($.trim($("#deviceNo").val()));
            if(model.isBind==false){
                return false;
            }
            $.ajax({
                url : prefix + "/insertDogDeviceNo",
                type : "post",
                data : {deviceNo:$.trim($("#deviceNo").val()),traceId:traceId},
                success : function(res) {
                    if (res.status ==200) {
                        layer.msg(bindSuccess);
                        layer.close(index);
                        reLoad();
                    } else {
                        layer.msg(bindFail);
                    }
                }
            });

        },
        btn2:function (index,layero) {
            layer.close(index);
        }

    });
}

//检查设备是否可用
function getDeviceNo(e) {
    if($.trim(e.value)==''){
        return false
    }
    $.ajax( {
        type : "get",
        url :prefix+"/checkDeviceIsUse",
        data : {deviceNo:$.trim(e.value)},
        success : function(res) {
            if(res.code != 0) {
                layer.msg(res.msg);
                model.isBind=false;
            }else {
                model.isBind=true;
            }
        }
    });
}


//犬主更换
function ownerChange(row){
    window.location=prefix+"/addOwnerChange";
}

//项圈更换
function netletChange(traceId){
    window.location=prefix+"/addNeckletChange/"+traceId+"";
}
