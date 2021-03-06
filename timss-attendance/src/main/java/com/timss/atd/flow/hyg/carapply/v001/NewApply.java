package com.timss.atd.flow.hyg.carapply.v001;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import net.sf.json.JSONObject;
import com.timss.attendance.bean.CarApplyBean;
import com.timss.attendance.dao.CarApplyDao;
import com.timss.attendance.service.AtdAttachService;
import com.timss.attendance.service.CarApplyService;
import com.yudean.itc.util.json.JsonHelper;
import com.yudean.mvc.bean.userinfo.UserInfoScope;
import com.yudean.mvc.service.ItcMvcService;
import com.yudean.workflow.service.WorkflowService;
import com.yudean.workflow.task.TaskHandlerBase;
import com.yudean.workflow.task.TaskInfo;
/**
 * 提交用车申请
 **/
public class NewApply extends TaskHandlerBase{
	@Autowired
	private ItcMvcService itcMvcService;
	@Autowired
    private WorkflowService workflowService;
	@Autowired
	private CarApplyDao carApplyDao;
	@Autowired
	private CarApplyService carApplyService;
	@Autowired 
    private AtdAttachService attachService;
	
	private static final Logger LOG = Logger.getLogger( NewApply.class );
	
	public void init(TaskInfo taskInfo){
		String caId = workflowService.getVariable(taskInfo.getProcessInstanceId(),  "businessId").toString();
		CarApplyBean bean = carApplyDao.queryById(caId);
		String status = bean.getStatus();
		if(!"draft".equals(status)){
			status = "newApply";
		}
		bean.setCaId(caId);
		bean.setStatus(status);
		carApplyDao.updateCarApply(bean);
	}
	
	public void onComplete(TaskInfo taskInfo){
		UserInfoScope userInfo = itcMvcService.getUserInfoScopeDatas();
		String caId = workflowService.getVariable(taskInfo.getProcessInstanceId(),  "businessId").toString();
		String businessData = null;
		try {
			businessData = userInfo.getParam("businessData");
			JSONObject businessDataobj = JSONObject.fromObject( businessData );
			String carApplyData = businessDataobj.getString( "carApplyData" );
			CarApplyBean bean = JsonHelper.toObject(carApplyData,CarApplyBean.class);
			carApplyDao.updateCarApply(bean);
			
		//	String[] uploadIds = businessDataobj.getString( "uploadIds" ).split(",");
			String[] uploadIds = null;
			if(!"".equals(businessDataobj.getString( "uploadIds" ))){
				uploadIds = businessDataobj.getString( "uploadIds" ).split(",");
			}
			attachService.delete("carApply", caId, null);
	        if(null !=uploadIds &&uploadIds.length != 0){
	        	attachService.insert("carApply", caId, uploadIds);
	        }
			carApplyService.updateCurrHandlerUser(caId, userInfo, "normal");
		} catch (Exception e) {
			LOG.error("获取审批信息失败");
		}
	}
	
	public void beforeRollback(TaskInfo taskInfo, String destTaskKey){
		
	}
}
