package com.soholy.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.soholy.mapper.AepDataMapper;
import com.soholy.service.AepCbService;
import com.soholy.utils.R;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Base64;
import java.util.logging.Logger;

/**
 * @author guanY
 * @version 1.0.0
 * @ClassName CallbackControlller
 * @Description (电信平台回调)
 * @Date 2018年4月12日 下午2:36:20
 */

@RestController
@RequestMapping(value = "/callback", produces = {"application/json;charset=UTF-8"})
public class AepCbController {

    private static final Logger logger = Logger.getLogger(String.valueOf(AepCbController.class));

    @Autowired
    private AepCbService aepService;

    @Autowired
    private AepDataMapper aepDataMapper;


    @GetMapping("/test")
    public R test() {
        return R.ok();
    }

    /**
     * 测试用 数据推送
     *
     * @param body
     * @return
     */
    @RequestMapping(value = "/lwm2m")
    public R callback(@RequestBody String body) {
        System.err.println(body);
        String payload = JSON.parseObject(body).getString("payload");
        if (StringUtils.isNotBlank(payload)) {
            try {
                String base64Str = JSON.parseObject(payload).getString("APPdata");
                byte[] input = Base64.getDecoder().decode(base64Str);
                String dataStr = new String(input, "utf-8");
                System.err.println("input str:" + dataStr);
                if (1 != aepDataMapper.saves(Arrays.asList(dataStr))) {
                    return R.error();
                }
                this.deviceDatasChanged_v2(body);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return R.ok();
    }


    /**
     * @param body
     * @throws Exception
     * @Description (批量设备数据_v2)
     */
    @RequestMapping(value = "/deviceDatasChanged_v2")
    public R deviceDatasChanged_v2(@RequestBody String body) throws Exception {
        logger.info(body);
        try {
            JSONObject json = JSON.parseObject(body);
            aepService.deviceDatasChangedMsg_v2(json);
        } catch (Exception e) {
            e.printStackTrace();
            logger.info("回调解析错误！");
        }
        return R.ok();
    }


    /**
     * @param body
     * @throws Exception
     * @Description (其他推送通知)
     */
    @RequestMapping(value = "/other_v2")
    public R other_v2(@RequestBody String body) throws Exception {
        logger.info(body);
        return R.ok();
    }


}
