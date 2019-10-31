package com.soholy.service.activemq.producer;


import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.soholy.common.ApplicationContextProvider;
import com.soholy.entity.TDeviceCommand;
import com.soholy.entity.TDeviceInfo;
import com.soholy.mapper.TDeviceCommandMapper;
import com.soholy.mapper.TDeviceInfoMapper;
import com.soholy.pojo.*;
import com.soholy.pojo.aep.command.rq.BaseCommandAepRp;
import com.soholy.pojo.aep.em.CmdType_lwM2M;
import com.soholy.pojo.aep.rq.EntiretyAepRq;
import com.soholy.service.SimpleDecode;
import com.soholy.service.activemq.AcmqService;
import com.soholy.service.command.DeviceCommandIotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 回调处理类
 */
public class AmqProducer implements Runnable {

    private static final Logger logger = LoggerFactory.getLogger(AmqProducer.class);

    public AmqProducer(JSONObject json) {
        this.json = json;
        this.deviceCommandIotService = ApplicationContextProvider.getBean(DeviceCommandIotService.class);
        this.acmqService = ApplicationContextProvider.getBean(AcmqService.class);
        this.simpleDecode = ApplicationContextProvider.getBean(SimpleDecode.class);
        this.tDeviceCommandMapper = ApplicationContextProvider.getBean(TDeviceCommandMapper.class);
        this.tDeviceInfoMapper = ApplicationContextProvider.getBean(TDeviceInfoMapper.class);
        logger.info("activemq produces init success!");
    }

    private JSONObject json;
    private TDeviceCommandMapper tDeviceCommandMapper;
    private DeviceCommandIotService deviceCommandIotService;
    private AcmqService acmqService;
    private TDeviceInfoMapper tDeviceInfoMapper;
    private SimpleDecode simpleDecode;

    @Override
    public void run() {
        logger.info(String.valueOf(json));
        String deviceIdIot = json.getString("deviceId");//设备平台id
        String payloadStr = json.getString("payload");
        String protocolType = json.getString("protocol");

        //NB网关
        PayLoad payload = null;
        if (AepType.NB_GATEWAY.getAepType().equals(protocolType)) {
            TupPayload tupPayload = JSON.parseObject(payloadStr, TupPayload.class);
            payload = tupPayload;
            if (tupPayload != null && null == tupPayload.getLength() && tupPayload.getUpdata() == null) {
                payload = JSON.parseObject(payloadStr, OldTupPayLoad.class);
            }
        } else if (AepType.LWM2M.getAepType().equals(protocolType)) {
            payload = JSON.parseObject(payloadStr, LwM2MPayLoad.class);
        } else {
            logger.info("协议有误！");
            return;
        }
        logger.debug("receive device push deviceIdIot:" + deviceIdIot);

        // 根据设备验证码查询设备信息
        List<TDeviceInfo> tdeviceList = tDeviceInfoMapper.selectList(Wrappers.<TDeviceInfo>lambdaQuery().eq(TDeviceInfo::getDeviceIotId, deviceIdIot));
        if (tdeviceList == null || tdeviceList.size() != 1) {// 判断设备是否在系统中已存在
            logger.info("设备上传数据设备id不存在！");
            return;
        }
        TDeviceInfo tDevice = tdeviceList.get(0);

        //数据解析处理（设备响应命令处理）
        EntiretyAepRq aepRq = cmdResHandle(payload, tDevice);


        //开始数据回复
        if (!resStart(aepRq, tDevice)) {
            //设备未激活
            return;
        }

        //数据推送到mq中
        if (aepRq != null) {
            acmqService.dataPushMq(json.toJSONString(aepRq));
        }

        //检查命令下发
        deviceCommandIotService.depositoryCommandCheckAndSend(tDevice.getDeviceNo(), tDevice.getDeviceIotId());

    }

    /**
     * 检测开机数据并且回复
     *
     * @param aepRq
     */
    private boolean resStart(EntiretyAepRq aepRq, TDeviceInfo device) {
        boolean fal = true;//未激活
        //0混合 1gps 2wifi 3开机 4 省电 5低电告警
        if (aepRq != null && aepRq.getType() != null && aepRq.getType() == 3) {
            Integer resultCode = 2;//未激活
            if (device != null && device.getStatus() != null && device.getStatus() == 1) {//设备已激活
                resultCode = 1;//激活成功
            } else {
                fal = false;
            }
            //1 成功 2 失败
            //下发开机回复
            try {
                deviceCommandIotService.sendCommand_v2_lwM2M(CmdType_lwM2M.STARTING_UP, "" + resultCode, deviceCommandIotService.generateMid(), device.getImei());
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return fal;
    }


    private EntiretyAepRq cmdResHandle(PayLoad payload, TDeviceInfo tDevice) {
        if (payload == null || tDevice == null) {
            return null;
        }
        try {
            //命令响应
            String inJson = simpleDecode.simpleParasToJson(payload);
            //命令响应
            if (JSON.parseObject(inJson).containsKey("mid")) {
                BaseCommandAepRp cmdRp = JSON.parseObject(inJson, BaseCommandAepRp.class);
                List<BaseCommandAepRp.CommandAepRpRet> rets = cmdRp.getRets();
                if (rets != null && rets.size() > 0) {
                    rets.stream()
                            .forEach(x -> {
                                //1成功 2失败 3其他错误
                                Integer ret = x.getRet();
                                String mid = x.getMid();
                                //0待发送，1平台已下发，2iot已下发，3命令已送达，4发送失败，5成功响应，6失败响应
                                int cmdStatus = ret == 1 ? 5 : 6;
                                if (1 != tDeviceCommandMapper.update(null,
                                        Wrappers.<TDeviceCommand>lambdaUpdate()
                                                .eq(TDeviceCommand::getDeviceNo, cmdRp.getImei())
                                                .eq(TDeviceCommand::getCmdMid, Long.valueOf(mid))
                                                .set(TDeviceCommand::getCmdStatus, cmdStatus)
                                                .set(TDeviceCommand::getCmdRspTime, LocalDateTime.now()))) {
                                    logger.error("一條命令下發后修改命令狀態修改失敗！命令id:" + mid);
                                }
                            });
                }
            }
            //数据上报
            EntiretyAepRq aepRq = JSON.parseObject(inJson, EntiretyAepRq.class);
            aepRq.setT(tDevice);
            return aepRq;
        } catch (Exception e) {
        }
        return null;
    }

}
