package com.timss.purchase.flow.swf.prepay.v001;

import java.util.Collections;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.timss.purchase.flow.abstr.DefOrderPayProcess;
import com.timss.purchase.service.PurPayService;
import com.timss.purchase.service.swf.SendPayEmailService;
import com.yudean.itc.dto.sec.SecureUser;
import com.yudean.itc.manager.sec.IAuthorizationManager;
import com.yudean.mvc.bean.userinfo.UserInfoScope;
import com.yudean.mvc.service.ItcMvcService;
import com.yudean.workflow.service.WorkflowService;
import com.yudean.workflow.task.TaskInfo;
import com.yudean.workflow.utils.WorkFlowConstants;

public class GeneralManagerAudit extends DefOrderPayProcess {
    @Autowired
    private WorkflowService workflowService;
    @Autowired
    private PurPayService purPayService;
    @Autowired
    private ItcMvcService itcMvcService;
    @Autowired
    public IAuthorizationManager authManager;
    @Autowired
    SendPayEmailService sendPayEmailService;
    private static Logger LOG = Logger.getLogger(GeneralManagerAudit.class);
    
    @SuppressWarnings("unchecked")
    @Override
    public void init(TaskInfo taskInfo) {
      UserInfoScope userInfoScope = itcMvcService.getUserInfoScopeDatas();
      String procInstId = taskInfo.getProcessInstanceId();
      String businessId = workflowService.getVariable(procInstId, "businessId") == null ? "": String.valueOf(workflowService.getVariable(procInstId, "businessId"));
      String userId = "";
      String userName = "";
      String siteId = userInfoScope.getSiteId();
      List<String> uIdList = (List<String>) workflowService.getVariable(procInstId,WorkFlowConstants.CURRENT_TASK_CANDIDATE_USER);
      try {
          if (null == uIdList || uIdList.isEmpty()) {
              uIdList = Collections.emptyList();
          } else {
              StringBuffer sbuffer = new StringBuffer("");
              for (String userIdStr : uIdList) {
                 SecureUser user = authManager.retriveUserById(userIdStr, siteId);
                 sbuffer.append(user.getName()).append(",");
              }
              userName = sbuffer.substring(0, sbuffer.length() - 1);
          }
          if (StringUtils.isNotEmpty(userInfoScope.getParam("userId"))) {
              // 退回
              userId = userInfoScope.getParam("userId");
              userName = authManager.retriveUserById(userId, siteId).getName();
          }
          purPayService.updatePurPayInfoTransactor( businessId, userName );
      } catch (Exception e) {
          LOG.info( ">>>>>>>>>>>>>>>>>>> 更新状态和待办人异常", e );
      }
    }
    
    @Override
    public void onComplete(TaskInfo taskInfo) {
      String procInstId = taskInfo.getProcessInstanceId();
      String businessId = workflowService.getVariable(procInstId, "businessId") == null ? "": String.valueOf(workflowService.getVariable(procInstId, "businessId"));
      try {
          purPayService.updatePurPayStatus( businessId, "processed" );
          purPayService.updatePurPayInfoTransactor( businessId, "" );
          purPayService.updatePurPayAuditDate( businessId );
          //判断是否还有下一个节点,如果没有,则表示当前节点为最后一个节点
          List<String> nextTasks = workflowService.getNextTaskDefKeys(taskInfo.getProcessInstanceId(), taskInfo.getTaskDefKey());
          if(nextTasks == null || nextTasks.size() == 0){
        	  //发送短信
    		  sendPayEmailService.sendPayEmail(businessId);
          }
      } catch (Exception e) {
          LOG.warn(">>>>>>>>>>>>>>>>>>> 更新状态异常", e);
      }
    }
}
