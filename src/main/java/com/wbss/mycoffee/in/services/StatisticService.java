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

package com.wbss.mycoffee.in.services;

import java.util.List;

import com.wbss.mycoffee.ui.helper.view.Product;
import com.wbss.mycoffee.ui.helper.view.Statistic;

/**
 * 
 * @author Guido Amrein
 *
 */
public interface StatisticService {

    /**
     * Get all products (beverages) with quantities for a client (machine)
     * @param client
     * @return list of products with their quantity
     */
    public List<Product> findProductsMaxQuantity(String client);
    
    /**
     * 
     * @param type statistic group criteria ('hour' or 'day')
     * @param dateFrom
     * @param dateTo
     * @return statistic object
     */
    public Statistic findStatisticData(String type, String dateFrom, String dateTo);

}