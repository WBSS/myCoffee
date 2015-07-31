/* 
 * Copyright 2015 W.B.S.S GmbH Zurich.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not 
 * use this file except in compliance with the License. You may obtain a copy 
 * of the License at 
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0 
 *   
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT 
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the 
 * License for the specific language governing permissions and limitations 
 * under the License.
 * 
 */

package com.wbss.mycoffee.ui.helper.view;

import java.util.List;

/**
 * Model for statistic data
 * 
 * @author Guido Amrein
 *
 */
public class Statistic {
    
    private List<TimeData> timeData;
    private List<Product> productData;
    private List<Machine> machineData;
    
    public List<TimeData> getTimeData() {
        return timeData;
    }
    public void setTimeData(List<TimeData> timeData) {
        this.timeData = timeData;
    }
    public List<Product> getProductData() {
        return productData;
    }
    public void setProductData(List<Product> productData) {
        this.productData = productData;
    }
    public List<Machine> getMachineData() {
        return machineData;
    }
    public void setMachineData(List<Machine> machineData) {
        this.machineData = machineData;
    }
}
