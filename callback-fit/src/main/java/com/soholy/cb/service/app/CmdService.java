package com.soholy.cb.service.app;

import com.alibaba.fastjson.JSONObject;
import com.soholy.cb.enums.CmdType;
import com.soholy.cb.enums.CodecVersion;

public interface CmdService {
  int generateMid();

  /**
   * @param cmdType     命令类型
   * @param cmdValue    命令值
   * @param mid
   * @param deviceIotId 设备编号
   * @return iot_command_id
   * resultObj.put("commandId", object.getString("commandId"));
   * resultObj.put("output", input);
   * @throws Exception
   * @Description (给设备发送命令)
   */
  JSONObject sendCommand(CmdType cmdType, Integer cmdValue, Integer mid, String deviceIotId, CodecVersion codecVersion) throws Exception;
}
