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

import static org.junit.Assert.assertTrue;

import java.util.List;

import javax.inject.Inject;

import org.junit.Test;

import com.wbss.mycoffee.in.helper.domain.Client;

/**
 * Client (machine) service test class
 * 
 * @author Guido Amrein
 *
 */
public class ClientServiceTest extends BaseTest {

    @Inject
    ClientService clientService;

    @Test
    public void testFindAllValid() {

	List<Client> lstClients = clientService.findAllValid();

	assertTrue(lstClients != null && lstClients.size() > 0);

	for (Client client : lstClients) {
	    System.out.println(client.getClient() + " " + client.getStatus());
	}

    }

}
