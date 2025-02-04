package com.soholy.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.soholy.entity.AepData;
import com.soholy.entity.BaseRt;
import com.soholy.entity.TDeviceInfo;
import com.soholy.mapper.AepDataMapper;
import com.soholy.mapper.TDeviceInfoMapper;
import com.soholy.utils.R;
import com.soholy.utils.ReqPage;
import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@Log
public class DataContorller {


    @Autowired
    private AepDataMapper aepDataMapper;


    @Autowired
    private TDeviceInfoMapper tDeviceInfoMapper;

    @GetMapping("/view")
    String view() {
        return "index";
    }

    @GetMapping("/view/devs")
    @ResponseBody
    R devs() {
        return R.ok(tDeviceInfoMapper.selectList(Wrappers.<TDeviceInfo>lambdaQuery().eq(TDeviceInfo::getStatus, 1).orderByDesc(TDeviceInfo::getCreateDate)));
    }

    @GetMapping("/view/datas")
    @ResponseBody
    R list(@RequestParam(value = "imei", required = false) String imei,
           @RequestParam(value = "format", required = false) boolean format,
           @RequestParam(value = "pageNo", required = false, defaultValue = "1") Integer pageNo,
           @RequestParam(value = "pageSize", required = false, defaultValue = "10") Integer pageSize, Model model) {

        List<BaseRt> list = getList(imei, format, pageNo, pageSize);
        model.addAttribute("list", list);

        LambdaQueryWrapper<AepData> query = Wrappers.lambdaQuery();
        if (StringUtils.isNoneBlank(imei)) {
            query.like(AepData::getContent, imei);
        }
        Integer total = aepDataMapper.selectCount(query);

        Page<BaseRt> page = new Page<>();
        page.setTotal(total);
        page.setRecords(list);

        return R.ok(page);
    }

    private List<BaseRt> getList(String imei, boolean format, Integer pageNo, Integer pageSize) {
        imei = imei == null || imei.trim().length() == 0 ? null : imei;
        ReqPage page = new ReqPage(pageNo, pageSize);
        log.info(page.getOffset() + "   " + page.getLimit());
        List<BaseRt> rest = aepDataMapper.findDatas(page.getOffset(), page.getLimit(), imei);
        return rest.stream()
                .map((BaseRt x) -> {
                    final String str = (String) x.getContent();
                    try {
                        final JSONObject jsonObject = JSON.parseObject(str);
                        if (format) { // 格式化时间格式
                            final String[] formatKeys = {"time", "start_time"};
                            final String pattern = "yyyy-MM-dd HH:mm:ss.SSS";
                            SimpleDateFormat sdf = new SimpleDateFormat(pattern);
                            jsonObject.entrySet().stream()
                                    .forEach(z -> {
                                        Object val = z.getValue();
                                        if (val instanceof JSONArray) {
                                            JSONArray arrJson = (JSONArray) val;
                                            arrJson.stream().forEach(n -> {
                                                JSONObject objJson = (JSONObject) n;
                                                Arrays.stream(formatKeys)
                                                        .filter(objJson::containsKey)
                                                        .forEach(t -> {
                                                            Long time = objJson.getLong(t);
                                                            objJson.put(t, sdf.format(new Date(time)));
                                                        });
                                            });
                                        } else if (val instanceof JSONObject) {
                                            JSONObject objJson = (JSONObject) val;
                                            Arrays.stream(formatKeys)
                                                    .filter(objJson::containsKey)
                                                    .forEach(t -> {
                                                        Long time = objJson.getLong(t);
                                                        objJson.put(t, sdf.format(new Date(time)));
                                                    });
                                        }
                                    });
                        }
                        x.setContent(jsonObject);
                        return x;
                    } catch (Exception e) {
                        return x;
                    }
                }).collect(Collectors.toList());
    }

    /**
     * 测试用  查询接口
     * http://119.147.209.163:8081/nm/callback/lwm2m/data
     *
     * @param imei
     * @param format
     * @param pageNo
     * @param pageSize
     * @return
     */
    @RequestMapping(value = "/callback/lwm2m/data", produces = {"application/json;charset=UTF-8"})
    public @ResponseBody
    R callback(@RequestParam(value = "imei", required = false) String imei,
               @RequestParam(value = "format", required = false) boolean format,
               @RequestParam(value = "pageNo", required = false, defaultValue = "1") Integer pageNo,
               @RequestParam(value = "pageSize", required = false, defaultValue = "50") Integer pageSize) {
        try {
            List<BaseRt> list = getList(imei, format, pageNo, pageSize);
            return R.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return R.error();
    }

}
