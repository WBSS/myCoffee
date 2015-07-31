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

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.apache.openjpa.lib.log.Log;
import org.kairosdb.client.HttpClient;
import org.kairosdb.client.builder.AggregatorFactory;
import org.kairosdb.client.builder.DataPoint;
import org.kairosdb.client.builder.QueryBuilder;
import org.kairosdb.client.builder.TimeUnit;
import org.kairosdb.client.builder.grouper.TagGrouper;
import org.kairosdb.client.response.GroupResult;
import org.kairosdb.client.response.Queries;
import org.kairosdb.client.response.QueryResponse;
import org.kairosdb.client.response.Results;
import org.kairosdb.client.response.grouping.TagGroupResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.wbss.mycoffee.ui.helper.view.Machine;
import com.wbss.mycoffee.ui.helper.view.Product;
import com.wbss.mycoffee.ui.helper.view.Statistic;
import com.wbss.mycoffee.ui.helper.view.TimeData;

/**
 * Kairo DB service implementation
 * 
 * @author Guido Amrein
 */
@Service("statisticService")
public class KairosDBStatisticServiceImpl implements StatisticService {

    private static final Logger LOG = Logger.getLogger(KairosDBStatisticServiceImpl.class);
    
    private static final String METRIC_VENDS = "machine.coffee.stat.free.vents";
    private static final String METRIC_VENDS_RELATIVE = "machine.coffee.stat.free.vents.relative";

    @Value("${host.kairosDB.url}")
    private String hostKairosDBUrl;

    @Override
    public List<Product> findProductsMaxQuantity(String client) {

	HttpClient httpClient = null;
	List<Product> lstProducts = new ArrayList<Product>();
	
	try {
	    httpClient = new HttpClient(hostKairosDBUrl);
	    
	    QueryBuilder builder = QueryBuilder.getInstance();
	    Map<String, String> tagMap = new HashMap<String, String>();
	    tagMap.put("machineId", client);
	    
	    builder.setStart(1, TimeUnit.YEARS)
	           .addMetric(METRIC_VENDS)
	           .addGrouper(new TagGrouper("beverage"))
	           .addAggregator(AggregatorFactory.createMaxAggregator(1, TimeUnit.YEARS))
	           .addTags(tagMap);
	    
	    QueryResponse queryResponse = httpClient.query(builder);
	    
	    if (queryResponse.getStatusCode() == 200) {
		Queries queries = queryResponse.getQueries().get(0);

		for (Results results : queries.getResults()) {
		    if (results.getGroupResults() != null) {

			Product product = new Product();
			// Get beverage
			for (GroupResult groupResult : results.getGroupResults()) {
			    
			    if (groupResult instanceof TagGroupResult) {
				TagGroupResult tagGroupResult = (TagGroupResult) groupResult;
				Map<String, String> groupValues = tagGroupResult.getGroup();
				product.setName(groupValues.get("beverage")
					.toString());
			    }
			}
			// Get value
			DataPoint dataPoint = results.getDataPoints().get(0);
			product.setQuantity(Integer.valueOf(dataPoint
				.getValue().toString()));

			lstProducts.add(product);
		    }
		}
	    }

	} catch (Exception e) {
	    LOG.error(e, e);
	} finally {
	    try {
		if (httpClient != null)
		    httpClient.shutdown();
	    } catch (IOException e) {
		LOG.error(e, e);
	    }
	}
	
	return lstProducts;
    }
    
    @Override
    public Statistic findStatisticData(String type, String dateFrom, String dateTo) {
	
	HttpClient httpClient = null;
	Statistic statistic = new Statistic();
	
	try {

	    httpClient = new HttpClient(hostKairosDBUrl);
	    
	    Date startDate = new SimpleDateFormat("ddMMyyyy").parse(dateFrom);
	    Date endDate = new SimpleDateFormat("ddMMyyyy").parse(dateTo);
	    
	    // Add one day to end date (= inclusive dateTo)
	    Calendar c = Calendar.getInstance();
	    c.setTime(endDate);
	    c.add(Calendar.DATE, 1);
	    endDate = c.getTime();	    
	    
	    QueryBuilder builder = QueryBuilder.getInstance();
	    
	    // Time data statistic
	    TimeUnit timeUnit = type.equals("hour") ? TimeUnit.HOURS : TimeUnit.DAYS;
	    builder.setStart(startDate)
		    .setEnd(endDate)
		    .addMetric(METRIC_VENDS_RELATIVE)
		    .addAggregator(AggregatorFactory.createSumAggregator(1, timeUnit));
	    
	    // Product statistics
	    builder.setStart(startDate)
	    	.setEnd(endDate)
	    	.addMetric(METRIC_VENDS_RELATIVE)
	    	.addGrouper(new TagGrouper("beverage"))
	    	.addAggregator(AggregatorFactory.createSumAggregator(10, TimeUnit.YEARS));

	    // Machine statistics
	    builder.setStart(startDate)
	    	.setEnd(endDate)
	    	.addMetric(METRIC_VENDS_RELATIVE)
	    	.addGrouper(new TagGrouper("machineId"))
	    	.addAggregator(AggregatorFactory.createSumAggregator(10, TimeUnit.YEARS));

	    
	    QueryResponse queryResponse = httpClient.query(builder);
	    
	    if (queryResponse.getStatusCode() == 200) {

		// Time data statistic result
		Queries queries = queryResponse.getQueries().get(0);
		List<TimeData> timeData = new ArrayList<TimeData>();

		for (Results results : queries.getResults()) {
		    for (DataPoint dataPoint : results.getDataPoints()) {
			timeData.add(getTimeData(dataPoint));
		    }
		}
		
		// Product statistics result
		queries = queryResponse.getQueries().get(1);
		List<Product> productData = new ArrayList<Product>();
		
		for (Results results : queries.getResults()) {
		    if (results.getGroupResults() != null) {
			
			Product product = new Product();
			// Get beverage
			for (GroupResult groupResult : results.getGroupResults()) {
			    if (groupResult instanceof TagGroupResult) {
				TagGroupResult tagGroupResult = (TagGroupResult) groupResult;
				Map<String, String> groupValues = tagGroupResult.getGroup();
				product.setName(groupValues.get("beverage")
					.toString());
			    }
			}

			// Get value
			if (results.getDataPoints().size() > 0) {
			    DataPoint dataPoint = results.getDataPoints().get(0);
			    product.setQuantity(Integer.valueOf(dataPoint.getValue().toString()));
			} else {
			    product.setQuantity(0);
			}
			
			productData.add(product);
		    }
		}

		// Machine statistics result
		queries = queryResponse.getQueries().get(2);
		List<Machine> machineData = new ArrayList<Machine>();
		
		for (Results results : queries.getResults()) {
		    if (results.getGroupResults() != null) {
			
			Machine machine = new Machine();
			// Get machine
			for (GroupResult groupResult : results.getGroupResults()) {
			    if (groupResult instanceof TagGroupResult) {
				TagGroupResult tagGroupResult = (TagGroupResult) groupResult;
				Map<String, String> groupValues = tagGroupResult.getGroup();
				machine.setName(groupValues.get("machineId")
					.toString());
			    }
			}

			// Get value
			if (results.getDataPoints().size() > 0) {
			    DataPoint dataPoint = results.getDataPoints().get(0);
			    machine.setQuantity(Integer.valueOf(dataPoint.getValue().toString()));
			} else {
			    machine.setQuantity(0);
			}
			
			machineData.add(machine);
		    }
		}
		
		statistic.setTimeData(timeData);
		statistic.setProductData(productData);
		statistic.setMachineData(machineData);
	    }

	} catch (Exception e) {
	    LOG.error(e, e);
	} finally {
	    try {
		if (httpClient != null)
		    httpClient.shutdown();
	    } catch (IOException e) {
		LOG.error(e, e);
	    }
	}
	
	return statistic;
    }
    
    /**
     * Convert DataPoint to TimeData object
     * @param dataPoint
     * @return TimeData object
     */
    private TimeData getTimeData(DataPoint dataPoint) {
	
	TimeData timeData = new TimeData();
	
	Calendar calendar = Calendar.getInstance();
	calendar.setTime(new Date(dataPoint.getTimestamp()));
	
	timeData.setYear(calendar.get(Calendar.YEAR));
	timeData.setMonth(calendar.get(Calendar.MONTH) + 1);
	timeData.setDay(calendar.get(Calendar.DAY_OF_MONTH));
	timeData.setHour(calendar.get(Calendar.HOUR_OF_DAY));
	timeData.setQuantity(Integer.valueOf(dataPoint.getValue().toString()));
	
	return timeData;
    }

}