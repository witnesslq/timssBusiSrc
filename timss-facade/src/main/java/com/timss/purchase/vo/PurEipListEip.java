package com.timss.purchase.vo;

import java.util.ArrayList;
import java.util.List;

import com.yudean.itc.dto.interfaces.eip.mobile.RetKeyValue;

/**
 * @title: {title}
 * @description: {desc}
 * @company: gdyd
 * @className: PurApplyListEip.java
 * @author: 890166
 * @createDate: 2014-9-25
 * @updateUser: 890166
 * @version: 1.0
 */
public class PurEipListEip {

    private String title;
    private List<RetKeyValue> rows = new ArrayList<RetKeyValue>();

    /**
     * @return the title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title the title to set
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * @return the rows
     */
    public List<RetKeyValue> getRows() {
        return rows;
    }

    /**
     * @param rows the rows to set
     */
    public void setRows(List<RetKeyValue> rows) {
        this.rows = rows;
    }

}
