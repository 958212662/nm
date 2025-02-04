
var model={
    orgId:null,
    pro:null
}
var prefix = "/biz/dogInfo/nectletChange"
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
            //刷新列表
            //返回参数说明：
            // data.id 防疫员id
            //data.userId 用户id
            //data.text 防疫员姓名
            model.pro=data.userId;
            reLoad();
        }
    });
}
function load() {
    $("#nectletChangeFileTable").bootstrapTable('destroy');
    $('#nectletChangeFileTable')
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
                        operator:change(model.pro),
                        string : $.trim($('#inputStr').val())
                    }
                },
                // //请求服务器数据时，你可以通过重写参数的方式添加一些额外的参数，例如 toolbar 中的参数 如果
                // queryParamsType = 'limit' ,返回参数必须包含
                // limit, offset, search, sort, order 否则, 需要包含:
                // pageSize, pageNumber, searchText, sortName,
                // sortOrder.
                // 返回false将会终止请求
                columns: [{
                    field: 'traceId',
                    title: traceId5,
                    align:'center',
                    valign:"middle"
                },{
                    field: 'oldNeckletNo',
                    title: oldDevice5,
                    align:'center',
                    valign:"middle"
                }, {
                    field: 'newNeckletNo',
                    title: newDevice5,
                    align:'center',
                    valign:"middle"
                }, {
                    field: 'createtime',
                    title: changeTime5,
                    align:'center',
                    valign:"middle",
                    formatter:function (value) {
                        return  timeStamp2String(value);
                    }
                }, {
                    field: 'changeReason',
                    title: changeReason5,
                    align:'center',
                    valign:"middle"
                },{
                    field: 'dogName',
                    title: dogName5,
                    align:'center',
                    valign:"middle"
                },{
                    field: 'name',
                    title: ownerName5,
                    align:'center',
                    valign:"middle"
                },{
                    field: 'phoneNum',
                    title: phone5,
                    align:'center',
                    valign:"middle"
                },{
                    field: 'town',
                    title: town5,
                    align:'center',
                    valign:"middle"
                },{
                    field: 'town',
                    title: address5,
                    align:'center',
                    valign:"middle",
                    formatter:function (value,row) {
                        return  row.pcName+row.no;
                    }
                },
                    {
                        title : operation5,
                        field : 'id',
                        align : 'center',
                        formatter : function(value, row, index) {
                            var f = '<a class="btn btn-success btn-sm '+check1+'" href="#" mce_href="#" title="查看" onclick="check(\''
                                + row.id
                                + '\')"><i class="fa"></i>'+detail5+'</a> ';
                            return f;
                        }
                    }],
                responseHandler:function(result){ //格式化数据
                    console.log(result);
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
    $('#nectletChangeFileTable').bootstrapTable('destroy');
    load();
}

//查询详情
function check(Id) {
    window.location="/biz/dogInfo/neckletChange/findOne?Id="+Id+"";
}




