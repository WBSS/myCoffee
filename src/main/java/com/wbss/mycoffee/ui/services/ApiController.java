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

package com.wbss.mycoffee.ui.services;

import java.nio.charset.Charset;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.SerializationConfig.Feature;
import org.codehaus.jackson.map.annotate.JsonSerialize.Inclusion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.wbss.mycoffee.in.helper.domain.Client;
import com.wbss.mycoffee.in.services.ClientService;
import com.wbss.mycoffee.in.services.StatisticService;
import com.wbss.mycoffee.ui.helper.view.Product;
import com.wbss.mycoffee.ui.helper.view.Statistic;

/**
 * Client api as spring controller
 * 
 * @author Guido Amrein
 *
 */
@Controller
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private ClientService clientService;
    @Autowired
    private StatisticService statisticService;
    

    /**
     * Get clients (machines)
     * @param response json
     * @throws Exception
     */
    @RequestMapping(value = "clients", method = RequestMethod.GET)
    @ResponseBody
    public void getClients(HttpServletResponse response) throws Exception {

	List<Client> lstClients = clientService.findAllValid();

	ObjectMapper mapper = getObjectMapper();

	String json = mapper.writer().writeValueAsString(lstClients);

	wirteJsonToResponse(json, response);
    }

    /**
     * Get products (beverages) data with quantities for a client
     * @param client
     * @param response json
     * @throws Exception
     */
    @RequestMapping(value = "products/maxQuantity/clients/{client}", method = RequestMethod.GET)
    @ResponseBody
    public void getProductsMaxQuantity(@PathVariable String client, HttpServletResponse response) throws Exception {

	List<Product> lstProducts = statisticService.findProductsMaxQuantity(client);

	ObjectMapper mapper = getObjectMapper();
	String json = mapper.writer().writeValueAsString(lstProducts);

	wirteJsonToResponse(json, response);
    }
    
    /**
     * Get statistic data within a time periode
     * @param type group by 'hour' or 'day'
     * @param dateFrom
     * @param dateTo
     * @param response json
     * @throws Exception
     */
    @RequestMapping(value = "statistic/{type}/{dateFrom}/{dateTo}", method = RequestMethod.GET)
    @ResponseBody
    public void getStatistic(@PathVariable String type, @PathVariable String dateFrom, 
	    @PathVariable String dateTo, HttpServletResponse response) throws Exception {

	Statistic statistic = statisticService.findStatisticData(type, dateFrom, dateTo);

	ObjectMapper mapper = getObjectMapper();

	String json = mapper.writer().writeValueAsString(statistic);

	wirteJsonToResponse(json, response);
    }

    /**
     * Write json data to response stream
     * @param json
     * @param response
     * @throws Exception
     */
    private void wirteJsonToResponse(String json, HttpServletResponse response)
	    throws Exception {

	AbstractHttpMessageConverter<String> stringHttpMessageConverter = new StringHttpMessageConverter(
		Charset.forName("UTF-8"));
	MediaType jsonMimeType = new MediaType(
		MediaType.APPLICATION_JSON.getType(),
		MediaType.APPLICATION_JSON.getSubtype(),
		Charset.forName("UTF-8"));

	if (stringHttpMessageConverter.canWrite(String.class, jsonMimeType)) {
	    stringHttpMessageConverter.write(json, jsonMimeType,
		    new ServletServerHttpResponse(response));
	}

    }

    /**
     * Get jackson object mapper
     * @return
     */
    private ObjectMapper getObjectMapper() {

	ObjectMapper mapper = new ObjectMapper();
	mapper.configure(Feature.FAIL_ON_EMPTY_BEANS, false);
	mapper.setSerializationInclusion(Inclusion.NON_NULL);

	return mapper;
    }

}
