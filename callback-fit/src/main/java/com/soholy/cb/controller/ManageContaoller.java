package com.soholy.cb.controller;

import com.alibaba.fastjson.JSONObject;
import com.soholy.cb.entity.TDeviceInfoEntity;
import com.soholy.cb.service.TDeviceIotService;
import com.soholy.cb.service.app.ManageService;
import com.soholy.cb.utils.R;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/device"})
public class ManageContaoller {
  @Autowired
  private TDeviceIotService tDeviceIotService;

  @Autowired
  private ManageService manageService;
  
  @RequestMapping(value = {"/register/{imei}"}, method = {RequestMethod.GET})
  public R register(@PathVariable("imei") String imei, String deviceBrand, String deviceBatch) throws Exception {
    if (StringUtils.isNotBlank(imei))
      return R.ok(this.tDeviceIotService.register(imei, deviceBrand, deviceBatch)); 
    return R.ok();
  }
  
  @RequestMapping({"/logoutDevice/{deviceIotId}"})
  public R logoutDevice(@PathVariable("deviceIotId") String deviceIotId) {
    try {
      this.tDeviceIotService.logout(deviceIotId);
      return R.ok();
    } catch (Exception e) {
      e.printStackTrace();
      return R.error(e.getMessage());
    } 
  }

  /**
   * 查询设备信息
   *
   * @param imei
   * @param meta 是否查询原信息
   * @return
   */
  @RequestMapping(value = "/{imei}")
  public R info(@PathVariable("imei") String imei,
                @RequestParam(value = "meta", required = false, defaultValue = "true") boolean meta) {
    try {
      List<TDeviceInfoEntity> devices = tDeviceIotService.findDevicesByIotId(imei, 1);
      if (meta && devices != null && devices.size() == 1) {
        JSONObject rt = manageService.findDeviceInfo(devices.get(0).getDeviceIotId());
        rt.put("meta",devices);
        return R.ok(rt);
      }
      return R.ok(devices);
    } catch (Exception e) {
      e.printStackTrace();
      return R.error(e.getMessage());
    }
  }
}
