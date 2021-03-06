var hasInitedLicInfo = false;
var licRisksData = [["lic1","高温"],["lic2","高压"],["lic3","触电"],["lic4","转动"],["lic5","高空坠落"],
	["lic6","窒息"],["lic7","中毒"],["lic8","辐射"],["lic9","着火"],["lic10","爆炸"]];
var licInfoField = [
	{id:"licRisks",title : "安全风险交底",type:"checkbox",data:licRisksData,wrapXsWidth:12,wrapMdWidth:12},
	{id:"licOther",title : "其他安全风险交底",linebreak:true,rules : {maxChLength :60}},
	{id:"licPlNo",title : "项目负责人",type:"combobox",options:{allowSearch:true,allowEmpty:true,remoteLoadOn:"init",url:basePath+ "ptw/ptwInfo/queryPtwUsersByGroup.do?role=PTW_PI"}},
	{id:"licDplNo",title : "机组值班负责人",type:"combobox",options:{allowSearch:true,allowEmpty:true,remoteLoadOn:"init",url:basePath+ "ptw/ptwInfo/queryPtwUsersByGroup.do?role=PTW_safe_exec"}},
	{id:"licWlAndTime",title : "许可人/时间",type:"label"},
	{id:"licStartTime",title : "许可开工时间",type:"datetime",dataType:"datetime",rules : {required:true}},
	{id:"licEndTime",title : "许可结束时间",type:"datetime",dataType:"datetime",rules : {required:true,greaterThan:"#f_licStartTime"}}
];

function joinLicRisks(){
	var licRisks = [];
	for(var i = 1 ; i <= 10 ; i++){
		if(ptwInfo['lic'+i] == 1){
			licRisks.push('lic'+i);
		}
	}
	ptwInfo.licRisks = licRisks.join(",");
	if(!ptwInfo.licOther){
		ptwInfo.licOther = "无";
	}
}
function initLicInfo(ptc){
	if(!hasInitedLicInfo){
		if(isFireWt){
			licInfoField = [
				{id:"licWlAndTime",title : "许可人/时间",type:"label"},
				{id:"licStartTime",title : "动火开工时间",type:"datetime",dataType:"datetime",rules : {required:true}},
				{id:"licEndTime",title : "动火结束时间",type:"datetime",dataType:"datetime",rules : {required:true,greaterThan:"#f_licStartTime"}}
			];
		}else{
			//处理许可信息的项目负责人变更
			//var licPlNoField = ptwUtil.findFieldById(licInfoField,"licPlNo");
			//licPlNoField.options.url = basePath+ "ptw/ptwInfo/queryPtwUsersByGroup.do?role=PTW_workpic_"+ptc;
		}
		joinLicRisks();
		
		$("#licInfoDiv").show().iFold("init");
		hasInitedLicInfo = true;
		
		
		$("#licInfoForm").iForm("init",{"fields":licInfoField,"options":{validate:true,initAsReadonly:true}});
		$("#licInfoForm").iForm("setVal",ptwInfo);
		
		/*$("#licInfoForm").iForm("endEdit");*/
	}
	
}

function preLicPtw(){
	
	$("#ptw_btn_apprv").hide();
	$("#ptw_btn_apprvSubmit").show();
	
	//按钮组全部隐藏
	$("#div_btn_group .btn-default").hide();
	$("#ptw_btn_print").hide();
	$("#ptw_btn_modify").show();
	$("#ptw_btn_addSafe").show();
	if(!isFireWt){
		$("#ptw_btn_attachFire").show();
	}
	//Priv.apply();
	if(700 != ptwStatus){ //非终结状态不能生成标准工作票
		$("#ptw_btn_ptwNewSptw").hide();
	} 
	FW.fixToolbar("#ptwToolbar");
	
	$("#baseInfoForm").iForm('beginEdit','keyBoxNo');
	initLicInfo(ptwTypeCode);
	$("#licInfoForm").iForm('beginEdit');
	$("#licInfoForm").iForm("hide","licWlAndTime");
}


function getLicInfo(){
	var licInfo = $("#licInfoForm").iForm("getVal");
	licInfo.keyBoxNo = $("#baseInfoForm").iForm('getVal','keyBoxNo');
	if(!isFireWt){
		licInfo.licPl = $("#f_licPlNo").iCombo('getTxt');
		licInfo.licDpl = $("#f_licDplNo").iCombo('getTxt');
	}
	return licInfo;
}

/**许可弹出框带出的安全措施数据*/
function getLicSafeItems(){
	return getSafeInputs().safeItems;
}
/**许可工作票*/
function licPtw(){
	//如果处于编辑模式，则需要同时将编辑的数据更新上去
	var params = getPtwInfoForSave();
	if(!params){
		return false;	
	}
	//验证工作票负责人，只允许有一张已许可的票
	$.ajaxSetup({'async':false});
	var wpicResult = verifyWpic();
	if(wpicResult == false){
		return false;
	}
    $.ajaxSetup({'async':true});
	var src = basePath + "page/ptw/core/popVerifyLic.jsp?isFireWt="+isFireWt;//对话框B的页面
	var dlgOpts = {
        width : 800,
        height:450,
        title:"许可工作票"
    };
	var btnOpts = [{
        "name" : "取消",
        "onclick" : function(){
            return true;
        }
    },{
        "name" : "确定",
        "style" : "btn-success",
        "onclick" : function(){
            //itcDlgContent是对话框默认iframe的id
            var p = _parent().window.document.getElementById("itcDlgContent").contentWindow;
            //获取弹出框的数据，如果验证不通过，返回值为null
            var form = p.getFormData();
            if(form != null){
            	params.id = ptwId;
            	params.password = form.formData.password;
            	params.wtStatus = 500;
            	params.isEditing = isEditing;
            	params.wtNo = ptwNo;
            	params.safeItems = FW.stringify(form.safeItems);
            	if(form.formData.cfmGuardXf){
            		params.cfmGuardXf = form.formData.cfmGuardXf;
            		//params.cfmGuardXfNo = form.formData.cfmGuardXfNo;
            		params.cfmGuardXfTime = form.formData.cfmGuardXfTime;
            	}
            	$.post(basePath + "ptw/ptwInfo/licPtw.do",params,function(data){
					if(data.result == "ok"){
						FW.success("许可工作票成功");
						_parent().$("#itcDlg").dialog("close");
						//弹出审批框
						/*var taskId = data.taskId;
						if(taskId){
							var workFlow = new WorkFlow();
							workFlow.submitApply(taskId,"",agree,rollback,stop,"");
						}else{*/
							closePtw();
						/*}*/
					}else{
						FW.error(data.result);
					}
				},"json");
            }
        }
    }];
    FW.dialog("init",{"src":src,"dlgOpts":dlgOpts,"btnOpts":btnOpts});
}