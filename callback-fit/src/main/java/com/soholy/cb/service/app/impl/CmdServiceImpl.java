package com.soholy.cb.service.app.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.soholy.cb.config.IotPropertiesConfig;
import com.soholy.cb.entity.iot.deviceManager.CommandDTOV4;
import com.soholy.cb.enums.CmdType;
import com.soholy.cb.enums.CodecVersion;
import com.soholy.cb.service.app.AuthService;
import com.soholy.cb.service.app.CmdService;
import com.soholy.cb.service.codec.CodecService;
import com.soholy.cb.service.log.LogService;
import com.soholy.cb.utils.ByteUtils;
import com.soholy.cb.utils.HttpClientUtil;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CmdServiceImpl implements CmdService {
  @Autowired
  private IotPropertiesConfig conf;
  
  @Autowired
  private AuthService authService;
  
  @Autowired
  private CodecService codecService;
  
  @Autowired
  private LogService logService;
  
  private String callbackUrl() { return "https://" + this.conf.getCallbackHost() + ":" + this.conf.getCallbackPort(); }
  
  public int generateMid() { return (int)(Math.random() * 99999.0D); }
  
  public JSONObject sendCommand(CmdType cmdType, Integer cmdValue, Integer mid, String deviceIotId, CodecVersion codecVersion) throws Exception {
    if (StringUtils.isNotBlank(deviceIotId)) {
      mid = Integer.valueOf((mid == null) ? generateMid() : mid.intValue());
      byte[] input = this.codecService.generateComanmd(cmdType, cmdValue.intValue(), mid.intValue(),codecVersion);
      String url = this.authService.iotServerBaseUrl() + "/iocm/app/cmd/v1.4.0/deviceCommands";
      Map<String, String> headers = this.authService.setAuthentication();
      JSONObject root = new JSONObject();
      root.put("deviceId", deviceIotId);
      CommandDTOV4 dtov4 = new CommandDTOV4();
      dtov4.setServiceId(this.conf.getServiceId());
      dtov4.setMethod(this.conf.getCommandName());
      Map<String, Object> paras = new HashMap<String, Object>();
      paras.put(this.conf.getCommandValue(), input);
      dtov4.setParas(paras);
      root.put("command", dtov4);
      root.put("callbackUrl", callbackUrl() + "/callback/cmdrsp");

      logService.saveLog(null, input, root.toJSONString());

      HttpClientUtil.HttpResult result = HttpClientUtil.executeHttpParams(url, "POST", headers, root.toJSONString());
      if (result != null && result.getStatusCode().intValue() == 201) {
        JSONObject object = JSON.parseObject(result.getContent());
        JSONObject resultObj = new JSONObject();
        resultObj.put("commandId", object.getString("commandId"));
        resultObj.put("output", ByteUtils.byte2ToIntegerStr(input, 0, input.length).replaceAll("(.{2})", "0x$1 "));
        return resultObj;
      } 
    } 
    return null;
  }
}
