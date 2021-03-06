package com.timss.atd.flow.dpp.abnormity.v001;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.timss.attendance.util.AtdUserPrivUtil;
import com.timss.attendance.util.AtdWorkFlowUtil;
import com.timss.attendance.util.ProcessStatusUtil;
import com.yudean.mvc.bean.userinfo.UserInfoScope;
import com.yudean.mvc.service.ItcMvcService;
import com.yudean.workflow.service.WorkflowService;
import com.yudean.workflow.task.TaskHandlerBase;
import com.yudean.workflow.task.TaskInfo;

/**
 * 提交考勤异常申请
 */
public class AbnormityBzyjHandler extends TaskHandlerBase {
    @Autowired
    private WorkflowService workflowService;
    @Autowired
    private ItcMvcService itcMvcService;
    @Autowired
    private AtdUserPrivUtil privUtil;
    @Autowired
    private AtdWorkFlowUtil wfUtil;
    
    Logger logger = LoggerFactory.getLogger( AbnormityBzyjHandler.class );
    final String handlerName="DPP AbnormityBzyjHandler";
    
    /**
     * 回滚前
     */
    @Override
    public void beforeRollback(TaskInfo sourceTaskInfo, String destTaskKey) {
        logger.info( handlerName+" beforeRollback" );
        super.beforeRollback( sourceTaskInfo, destTaskKey );
    }

    /**
     * 初始化
     */
    @Override
    public void init(TaskInfo taskInfo) {
    	logger.info( handlerName+" init" );
    	wfUtil.updateAbnormityAuditStatusByTask(taskInfo, ProcessStatusUtil.DPP_ABNORMITY_BZSP);
        super.init( taskInfo );
    }

    @Override
    public void onShowAudit(String taskId){
    	logger.info( handlerName+" onShowAudit" );
    	UserInfoScope userInfo = privUtil.getUserInfoScope();
        try {
        	wfUtil.updateAbnormity(userInfo.getParam( "businessData" ));
        } catch (Exception e) {
        	logger.error( e.getMessage(), e );
        }
    }
    
    /**
     * 完成
     */
    @Override
    public void onComplete(TaskInfo taskInfo) {
    	logger.info( handlerName+" onComplete" );
    	wfUtil.completeCommonAbnormityApply(taskInfo);
        super.onComplete( taskInfo );
    }
}
