var contractAttachMap=[];
var contractCodeFilter=/^([A-Z0-9\-_])+$/;//合同编号正则表达式
var contractFormFields=[
	    {id:"id",type:"hidden"},
	    {id:"projectId",type:"hidden"},
	    {id:"bidId",type:"hidden"},
	    {id:"firstPartyId",type:"hidden"},
	    {id:"secondPartyId",type:"hidden"},
	    {id:"statusApp",type:"hidden"},
	    {id:"processInstId",type:"hidden"},
	    {id:"tipNo",type:"hidden"},
	    {title : "合同名称", id : "name",
	        rules: {
                required: true
	        }
	    },
	    {title : "合同金额(元)", id : "totalSum",
	        rules: {
                required: true,
                number:true
	        },
	        render:function(id){
	        	$("#"+id).on("change",function(){
	        		calculateTax("","");
	        	})
	        }
	    },
	    {title : "合同编号", id : "contractCode",
	        rules: {
                required: true,
                regex:contractCodeFilter,
                SynRemoteValid:{
                	url:basePath+"pms/contract/isContractCodeExisted.do",
                	type: "post",
                	data: {
                		contractCode: function() {
                			return $("#f_contractCode").val();
                		},
                		contractId:function(){
                			if(window.contractId){
                				return window.contractId;
                			}
                			
                			return "";
                		}
                	}
                }
	        },
            messages:{
            	SynRemoteValid:"合同编号已经存在"
            }
	    },
	    
	    {	title : "合同类型", 
	        id :'contractCategory',
	        type : "combobox",
	        dataType:'enum',
	        enumCat:'PMS_CONTRACT_CATEGORY',
	        rules: {
                required: true
	        },
	        options:{
	        	onChange:function(val){
	        		if(getReadOnly()){
	        			return;
	        		}
	        		var companyName=getCompany();
		        	var firstParty=companyName;
		        	var secondParty='';
		        	var form=pmsPager.opt.form;
		        	var val_type = form.iForm("getVal","type");
		        	var val_contractCode = form.iForm("getVal","contractCode");
		        	var editContractFirstInitCC  = pmsPager.editContractFirstInitCC;
		        	if(val_type=='income'){
		        		if(!editContractFirstInitCC){
			        		secondParty=companyName;
			        		firstParty='';
			        		form.iForm("setVal",{firstParty:"",fpLeader:"",fpPhone:"",spLeader:"",spPhone:"",secondParty:companyName,secondPartyId:null});
		        		}
		        		form.iForm('endEdit',['secondParty']);
		        		form.iForm('beginEdit',['firstParty']);
		        		initRemoteFirstPartyData(form);
//		        		if(!editContractFirstInitCC){
//		        			initRemoteFirstPartyData(form);
//		        		}
		        	}else{
		        		if(!editContractFirstInitCC){
		        			form.iForm("setVal",{secondParty:"",fpLeader:"",fpPhone:"",spLeader:"",spPhone:"",firstParty:companyName,firstPartyId:null});
		        		}
		        		form.iForm('endEdit',['firstParty']);
		        		form.iForm('beginEdit',['secondParty']);
		        		initRemoteSecondPartyData(form);
//		        		if(!editContractFirstInitCC){
//		        			initRemoteSecondPartyData(form);
//		        		}
		        		
		        	}
		        	if(""!=val_type&&null!=val_type){
		        		//由于表单init和setVal会带来两次的onchange事件，为了避免这个问题，需要对设置的值进行非空的判断判断
		        		//pmsPager.editContractFirstInitCC = false;
		        	}
		        	if(""!=val_contractCode){
		        		createContractCode();
		        	}
		        }
	        }
	    },
	    
	    {title : "所属项目", id : "projectName",rules:{required:true}},
	    {
	        title : "项目类型", 
	        id :'type',
	        type : "combobox",
	        dataType:'enum',
	        enumCat:'PMS_CONTRACT_TYPE',
	        rules: {
                required: true
	        },
	        options:{
	        	onChange:function(val){
	        		if(getReadOnly()){
	        			return;
	        		}
		        	var companyName=getCompany();
		        	var firstParty=companyName;
		        	var secondParty='';
		        	var form=pmsPager.opt.form;
		        	var editContractFirstInit  = pmsPager.editContractFirstInit;
		        	if(val=='income'){
		        		if(!editContractFirstInit){
			        		secondParty=companyName;
			        		firstParty='';
			        		form.iForm("setVal",{firstParty:"",fpLeader:"",fpPhone:"",spLeader:"",spPhone:"",secondParty:companyName,secondPartyId:null});
		        		}
		        		form.iForm('endEdit',['secondParty']);
		        		form.iForm('beginEdit',['firstParty']);
		        		initRemoteFirstPartyData(form);
//		        		if(!editContractFirstInit){
//		        			initRemoteFirstPartyData(form);
//		        		}
		        	}else{
		        		if(!editContractFirstInit){
		        			form.iForm("setVal",{secondParty:"",fpLeader:"",fpPhone:"",spLeader:"",spPhone:"",firstParty:companyName,firstPartyId:null});
		        		}
		        		form.iForm('endEdit',['firstParty']);
		        		form.iForm('beginEdit',['secondParty']);
		        		initRemoteSecondPartyData(form);
//		        		if(!editContractFirstInit){
//		        			initRemoteSecondPartyData(form);
//		        		}
		        	}
		        	if(""!=val&&null!=val){
		        		//由于表单init和setVal会带来两次的onchange事件，为了避免这个问题，需要对设置的值进行非空的判断判断
		        		//pmsPager.editContractFirstInit = false;
		        	}
		        }
	        }
	    },
	    {title : "签订时间", id:"signTime",type:"date",dataTime:'date',
	        rules: {
                required: true
	        }
	    },
	    {title:"所属招标",id:"bidName"},
	    {title : "合同甲方", id : "firstParty",
	    	linebreak:true,
	        rules: {
                required: true
	        }
	    },
	    {title : "甲方负责人", id : "fpLeader"
	    },
	    {title : "联系方式", id : "fpPhone"},
	    {title : "合同乙方", id : "secondParty",
	        rules: {
                required: true
	        }
	    },
	    {title : "乙方负责人", id : "spLeader"},
	    {title : "联系方式", id : "spPhone"},
	   
	    {
	        title : "合同描述", 
	        id : "command",
	        type : "textarea",
	        linebreak:true,
	        wrapXsWidth:12,
	        wrapMdWidth:12,
	        height:64,
	        rules:{
	        	maxChLength:330
	        },
	        messages:{
	        	maxChLength:"不可输入超过165个中文字符"
	        }
	    },
	    {title:"承办人",id:"createuser"}
];

var attachFormFields=[
{
	title : " ",
	id : "attach",
	linebreak : true,
	type : "fileupload",
	wrapXsWidth : 12,
	wrapMdWidth : 12,
	options : {
		"uploader" : basePath+"upload?method=uploadFile&jsessionid="+session,
		"delFileUrl" : basePath+"upload?method=delFile&key=" + valKey,
		"downloadFileUrl" : basePath+"upload?method=downloadFile",
		"swf" : basePath+"js/uploadify.swf",
		"fileSizeLimit" : 10 * 1024,
		"initFiles" :contractAttachMap,
		"delFileAfterPost" : true
	}
}
];

var payplanListColumns=[ [
              			/* {field:'ck',checkbox:true}, */
            			{
            				field : 'id',
            				hidden : true
            			}, {
            				field : 'ischecked',
            				hidden : true
            			}, {
            				field : 'ispayed',
            				hidden : true
            			}, {
            				field : 'payType',
            				title : '结算类型',
            				width : 120,
            				align : 'left',
            				fixed:true,
            				editor:{ 
            					type : 'combobox',

            					options : {
            						data : [ ['yfk',"预付款",true],['jdk',"进度款"],['jgk',"竣工款"],['zbj',"质保金"]]
            						//data:FW.parseEnumData("PMS_PAYPLAN_STAGE")
            					}
            				},
            				formatter: function(value,row,index){
             					return getPayType(value);
             				}
            			}, {
            				field : 'paySum',
            				title : '结算金额(元)',
            				width : 105,
            				align : 'right',
            				fixed : true,
            				editor:{
            					type:'text',
            					
            					options:{
            						rules:{
                						required:true,
                						number:true
                					},
            						onKeyUp : function(){
            							var me = $(this);
            							calculateTax(me,"paySum");
            						}
            					}
            					
            				}
            			}, {
            				field : 'percent',
            				title : '结算比例(%)',
            				width : 90,
            				align : 'right',
            				fixed : true,
            				editor:{
            					type:'text',
            					options:{
            						rules:{
                						required:true,
                						number:true
                					},
            						onKeyUp : function(){
            							var me = $(this);
            							calculateTax(me,"paycent");
            						}
            					}
            				}
            			,formatter: function(value,row,index){
             					
             					if(value){
             						return value;
             					}else{
             						var totalSumVal=$("#f_totalSum").val &&  $("#f_totalSum").val() || pmsPager.opt.data.data.totalSum;
             						
             						if(isNumber(row["paySum"]) && isNumber(totalSumVal)){
             							
             							
             							var percentVal=row["paySum"]/totalSumVal*100;
             							value=NumToFix2(percentVal);
             							row["percent"]=value;
             							return value;
             						}
             						
             						return value;
             					}
             				}
            					
            			}, {
            				field : 'needchecked',
            				title : '是否需要验收',
            				width : 120,
            				align : 'left',
            				fixed : true,
            				editor:{ 
            					type : 'combobox',
            					options : {
            						data : [ [true,"是"],[false,"否"]]
            					}
            				},
            				formatter: function(value,row,index){
            					if("true"==value ||true==value ||''==value||null==value||undefined==value){
             						return '是';
             					}else{
             						return '否';
             					}
             				}
            			}, {
            				field : 'checkStatus',
            				title : '验收状态',
            				width : 85,
            				align : 'left',
            				fixed:true,
            				formatter: function(value,row,index){
            					if(row["needchecked"]==false){
            						return '不需验收';
            					}
             					if(!value ){
             						return '未验收';
             					}else if(value=="approved"){
             						return '已验收';
             					}else if(value=="approving"){
             						return '验收中';
             					}
             					return value;
             				}
            			}, {
            				field : 'payStatus',
            				title : '结算状态',
            				width : 85,
            				align : 'left',
            				fixed:true,
            				formatter: function(value,row,index){
             					if(!value ){
             						return '未结算';
             					}else if(value=="approved"){
             						return '已结算';
             					}else if(value=="approving"){
             						return '结算中';
             					}
             					return value;
             				}
            			}, {
            				field : ' ',
            				title : '',
            				width : 85,
            				align : 'left'
            			},garbageColunms
            			
            			] ];
//初始化附件表单
function initAttachForm(data,$form,$wrapper,readOnly){
	var result={
			data:data,
			$form:$form,
			$wrapper:$wrapper,
			attachMap:contractAttachMap,
			attachFormFields:attachFormFields,
			readOnly:readOnly
		};
	initAttachFormTemplate(result);
}

//根据站点获取当前站点对应的公司名称
function getCompany(){
	return '粤电信息科技有限公司';
}

//根据金额。自动计算比例
function calculateTax(me,from){
	var totalSumVal=$("#f_totalSum").val &&  $("#f_totalSum").val() || pmsPager.opt.data.data.totalSum;
	if(""!=me){
		var p = me.parents(".datagrid-row");
		var paySum = p.children("td[field='paySum']").find("input");
		var percent = p.children("td[field='percent']").find("input");
		if("paycent"==from){
			//结算比例修改
			if(isNumber(percent.val()) && isNumber(totalSumVal)){
				var paySumVal=percent.val()*totalSumVal/100;
				paySum.val(NumToFix2(paySumVal));
			}
		}else{
			//结算金额修改
			if(isNumber(paySum.val()) && isNumber(totalSumVal)){
				var percentVal=paySum.val()/totalSumVal*100;
				percent.val(NumToFix2(percentVal));
			}
		}	
	}else{
		//合同金额修改时，修改结算金额
		var payPlanList = $("#payplanList").datagrid("getRows");
		for(var i = 0 ;i < payPlanList.length; i++){
			var paySum = $($("input[name^='paySum']")[i]);
			var percent = $($("input[name^='percent']")[i]);
			if(isNumber(paySum.val()) && isNumber(totalSumVal)){
				var percentVal=paySum.val()/totalSumVal*100;
				percent.val(NumToFix2(percentVal));
			}else if(isNumber(percent.val()) && isNumber(totalSumVal)){
				var paySumVal=percent.val()*totalSumVal/100;
				paySum.val(NumToFix2(paySumVal));
			}
		}
	}
}












function initPayplanWrapper(){
	if(!initPayplanWrapper.init){
		$('#payplanListWrapper').iFold();
		initPayplanWrapper.init=true;
	}
	
}
function initPayplansDataGrid(data){
	if(!dataGrid){
		dataGrid=$('#payplanList');
		dataGrid.datagrid({
			fitColumns:true,
			singleSelect:true,
			scrollbarSize:0,
			pageSize : pageSize,// pageSize为全局变量，自动获取的
			onDblClickRow : function(rowIndex, rowData) {
				if(pmsPager.opt.readOnly==true){
					return;
				}
				//dataGrid.datagrid('beginEdit',rowIndex);
			},
			data:data,
			onClickCell:function(rowIndex, field, value){
				return delelteGarbageColumnWhenPermit(rowIndex, field, value,dataGrid);
			},
			columns : payplanListColumns
		});
	}
}
//对数据进行验证
function valid(nextFunction){
	if(!$("#form1").valid()){
		return false;
	}
	if(!$("#payplanListWrapper").valid()){
		return false;
	}
	var rows=dataGrid.datagrid('getRows');
	for(var i=0;i<rows.length;i++){
		dataGrid.datagrid('endEdit',i);
	}
	var payplanData=dataGrid.datagrid('getRows');
	var result=0;
	for(var i=0;i<payplanData.length;i++){
		result+=parseFloat(payplanData[i].paySum);
	}
	var totolSum=$("#f_totalSum").val &&  $("#f_totalSum").val() || pmsPager.opt.data.data.totalSum;
	if(result!=totolSum){
		for(var i=0;i<rows.length;i++){
			dataGrid.datagrid('beginEdit',i);
		}
		
		if(!pmsPager.successValid){
			
			FW.confirm('合同金额与结算计划的金额总数不一致,确认提交吗？',{
				onConfirm : function(){
					pmsPager.successValid=true;
			        nextFunction.call();
			    },
			    onCancel : function(){
			        
			    }
			});
			return false;
		}else{
			return true;
		}
		
		
	}
	
	return true;
}

function getPayplanListData(dataGrid){
	var payplanData=null;
	if(dataGrid){
		var rows=dataGrid.datagrid('getRows');
		for(var i=0;i<rows.length;i++){
			dataGrid.datagrid('endEdit',i);
			
		}
		payplanData=dataGrid.datagrid('getRows');
	}
	return payplanData;
}
function hideColumn(){
	hideDataGridColumns(dataGrid,['payStatus','checkStatus']);
}

function addPayplan(){
	if(!addPayplan.init){
		addPayplan.init=true;
		initPayplansDataGrid();
		
		var row={"needchecked":true};
		dataGrid.datagrid('appendRow',row);
		var rowindex=dataGrid.datagrid('getRowIndex',row);
		dataGrid.datagrid('beginEdit',rowindex);
		
	}else{
		var row={"needchecked":true};
		dataGrid.datagrid('appendRow',row);
		var rowindex=dataGrid.datagrid('getRowIndex',row);
		dataGrid.datagrid('beginEdit',rowindex);
	}
	$('#b-add-payplan').html('继续添加结算计划');
}

//项目编码事件添加
function addContractCodeEvent(){
//	$("#f_contractCode").keydown(function(e){
//		var _this=this;
//		var code=e.which;
//		var keyValue=String.fromCharCode(code);
//		var regex=/[a-z]/;
//		if(regex.test(keyValue)){
//			_this.value=_this.value+keyValue.toUpperCase(); 
//			return false;
//		}
//		if(code==100 || code==13){
//			_this.value=_this.value.toUpperCase();
//			
//		}
//		
//	}).keyup(function(e){
//		var _this=this;
//		_this.value=_this.value.toUpperCase(); 
//	});
}

function initRemoteFirstPartyData(form){
	//招标相关
	var $firstPartyInput=$('#f_firstParty');
	
	//var $firstPartyIdInput = $('#f_firstPartyId');
	var firstPartyInit = {
		datasource : basePath + "pms/supplier/queryFuzzyByName.do",
		forceParse : "function", 
		clickEvent : function(id, name) {
			
			initFirstPartyDataBySupplierId(form,id)
		}
	};
	
	$firstPartyInput.iHint('init', firstPartyInit);
}

function initFirstPartyDataBySupplierId(form,id){
	$.post(basePath+'pms/supplier/querySupplierById.do',{id:id},function(result){
		result=result.data;

		var value={
			firstParty:result['name'],
			firstPartyId:result['companyNo'],
			fpLeader:result['contact'],
			fpPhone:result["tel"]
		};
		form.iForm("setVal", value);
		
	});
}

function initRemoteSecondPartyData(form){
	//招标相关
	var $secondPartyInput=$('#f_secondParty');
	
	var $secondPartyIdInput = $('#f_secondPartyId');
	var secondPartyInit = {
		datasource : basePath + "pms/supplier/queryFuzzyByName.do",
		orceParse : "function", 
		clickEvent : function(id, name) {
			
			initSecondPartyDataBySupplierId(form,id);
		}
	};
	
	$secondPartyInput.iHint('init', secondPartyInit);
}

function initSecondPartyDataBySupplierId(form,id){
	$.post(basePath+'pms/supplier/querySupplierById.do',{id:id},function(result){
		result=result.data;

		var value={
			secondParty:result['name'],
			secondPartyId:result['companyNo'],
			spLeader:result['contact'],
			spPhone:result["tel"]
		};
		form.iForm("setVal", value);
		
	});
}