package com.timss.finance.flow.itc.commondeptchooseone.v002;

import org.springframework.beans.factory.annotation.Autowired;

import com.timss.finance.service.FinanceMainService;
import com.yudean.itc.manager.sec.IAuthorizationManager;
import com.yudean.workflow.service.WorkflowService;
import com.yudean.workflow.task.TaskHandlerBase;
import com.yudean.workflow.task.TaskInfo;

public class ApplyApprove extends TaskHandlerBase{
	
	@Autowired
	WorkflowService wfs; //by type
	
	@Autowired
	IAuthorizationManager im;
	
	@Autowired
	private FinanceMainService financeMainService;
	
	public void init(TaskInfo taskInfo) {
		//个人业务招待费报销（申请人提交纸质审批）
		String fid = (String) wfs.getVariable( taskInfo.getProcessInstanceId(), "fid" );
		financeMainService.updateFinanceMainStatusByFid( "apply_approve", fid );
		
	}
	
}
